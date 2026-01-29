const supabase = require('../config/supabase');
const axios = require('axios');
const User = require('../models/User'); // MongoDB User Model

const ML_SERVICE_URL = 'http://127.0.0.1:8000/embed'; // Force IPv4

class LuggageService {

    /**
     * uploadLuggage
     * 1. Uploads image to Supabase Storage
     * 2. Calls Python ML Service to get embedding
     * 3. Saves metadata + embedding to Supabase DB (pgvector)
     * 4. Returns the created record
     */
    async reportLostLuggage(userId, imageFile, description, metadata) {
        try {
            // 1. Upload Image to Supabase Storage
            const fileExt = imageFile.originalname.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `lost/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('luggage-images')
                .upload(filePath, imageFile.buffer, {
                    contentType: imageFile.mimetype,
                    upsert: false
                });

            if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('luggage-images')
                .getPublicUrl(filePath);

            console.log('✅ Image uploaded:', publicUrl);

            // 2. Generate Embedding (Call Python Service)
            let embedding = [];
            try {
                const mlResponse = await axios.post(ML_SERVICE_URL, { imageUrl: publicUrl });
                embedding = mlResponse.data.embedding;
                console.log('✅ Embedding generated');
            } catch (mlError) {
                console.error('⚠️ ML Service Error:', mlError.message);
                // We can continue without embedding, but matching wont work
                // Alternatively, throw error. For now, let's allow it but warn.
            }

            // 3. Save to Supabase DB
            const { data: record, error: dbError } = await supabase
                .from('luggage')
                .insert({
                    mongo_user_id: userId,
                    image_url: publicUrl,
                    status: 'lost',
                    description: description,
                    metadata: metadata, // JSON object with color, brand, etc.
                    embedding: embedding.length > 0 ? embedding : null
                })
                .select()
                .single();

            if (dbError) throw new Error(`Database insert failed: ${dbError.message}`);

            return record;
        } catch (error) {
            console.error('Report Lost Luggage Error:', error);
            throw error;
        }
    }

    /**
     * findMatches
     * Calls the Postgres function match_luggage to find similar items
     */
    async findMatches(luggageId) {
        // First get the embedding of the luggage we are looking for
        const { data: target, error: fetchError } = await supabase
            .from('luggage')
            .select('embedding')
            .eq('id', luggageId)
            .single();

        if (fetchError || !target) throw new Error('Luggage not found');
        if (!target.embedding) throw new Error('This item has no embedding yet');

        // Call the RPC function we defined in SQL
        const { data: matches, error: matchError } = await supabase.rpc('match_luggage', {
            query_embedding: target.embedding,
            match_threshold: 0.80, // Similarity threshold
            match_count: 5
        });

        if (matchError) throw new Error(`Matching failed: ${matchError.message}`);

        // Filter out self-match
        const validMatches = matches.filter(m => m.id !== luggageId);

        // Persist matches to DB
        if (validMatches.length > 0) {
            const matchesToInsert = validMatches.map(m => ({
                lost_luggage_id: luggageId,
                found_luggage_id: m.id,
                similarity: m.similarity,
                status: 'pending'
            }));

            const { error: insertError } = await supabase
                .from('matches')
                .upsert(matchesToInsert, { onConflict: 'lost_luggage_id, found_luggage_id' });

            if (insertError) console.warn('Failed to save matches:', insertError.message);
        }

        return validMatches;
    }

    /**
     * Get all luggage reported by a user
     */
    async getUserLuggage(userId) {
        const { data, error } = await supabase
            .from('luggage')
            .select('*')
            .eq('mongo_user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Get all matches for a user
     */
    async getUserMatches(userId) {
        // 1. Get user's lost luggage IDs and details (so we have the lost item info)
        const { data: userLuggage, error: luggageError } = await supabase
            .from('luggage')
            .select('id, image_url, description')
            .eq('mongo_user_id', userId);

        if (luggageError) throw new Error(luggageError.message);
        if (!userLuggage || userLuggage.length === 0) return [];

        const luggageMap = {};
        userLuggage.forEach(l => luggageMap[l.id] = l);
        const luggageIds = userLuggage.map(l => l.id);

        // 2. Get matches for these lost items
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .in('lost_luggage_id', luggageIds)
            .order('similarity', { ascending: false });

        if (matchError) throw new Error(matchError.message);
        if (!matches || matches.length === 0) return [];

        // 3. Get details of the "found" luggage items
        const foundLuggageIds = matches.map(m => m.found_luggage_id);

        // Remove duplicates if any
        const uniqueFoundIds = [...new Set(foundLuggageIds)];

        const { data: foundItems, error: foundError } = await supabase
            .from('luggage')
            .select('*')
            .in('id', uniqueFoundIds);

        if (foundError) throw new Error(foundError.message);

        const foundMap = {};
        foundItems.forEach(item => foundMap[item.id] = item);

        // 4. Merge data to return a rich object
        return matches.map(m => ({
            ...m,
            lost_luggage: luggageMap[m.lost_luggage_id],
            found_luggage: foundMap[m.found_luggage_id]
        })).filter(m => m.found_luggage); // Only return complete matches
    }
}

module.exports = new LuggageService();
