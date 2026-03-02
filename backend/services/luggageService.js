const supabase = require('../config/supabase');
const axios = require('axios');
const User = require('../models/User'); // MongoDB User Model

// Dual AI service endpoints
const RESNET_SERVICE_URL = 'http://127.0.0.1:8000/embed-url';  // ResNet50 (ai-model/api.py)
const CLIP_SERVICE_URL = 'http://127.0.0.1:8001/embed';         // CLIP (ml-service/main.py)

class LuggageService {

    /**
     * Generate embedding from an image URL using a specific service
     * Returns null on failure (graceful degradation)
     */
    async _getEmbedding(serviceUrl, imageUrl, serviceName) {
        try {
            const response = await axios.post(serviceUrl, { imageUrl }, { timeout: 30000 });
            console.log(`✅ ${serviceName} embedding generated`);
            return response.data.embedding;
        } catch (error) {
            console.warn(`⚠️ ${serviceName} unavailable: ${error.message}`);
            return null;
        }
    }

    /**
     * reportLostLuggage
     * 1. Uploads image to Supabase Storage
     * 2. Calls BOTH AI services (ResNet50 + CLIP) for dual embeddings
     * 3. Saves metadata + both embeddings to Supabase DB
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

            // 2. Generate BOTH embeddings in parallel (ResNet50 + CLIP)
            const [resnetEmbedding, clipEmbedding] = await Promise.all([
                this._getEmbedding(RESNET_SERVICE_URL, publicUrl, 'ResNet50'),
                this._getEmbedding(CLIP_SERVICE_URL, publicUrl, 'CLIP')
            ]);

            // Extract structured metadata fields
            const color = metadata?.color || null;
            const bagType = metadata?.type || null;
            const brand = metadata?.brand || null;

            // 3. Save to Supabase DB (with both embeddings + metadata)
            const { data: record, error: dbError } = await supabase
                .from('luggage')
                .insert({
                    mongo_user_id: userId,
                    image_url: publicUrl,
                    status: 'lost',
                    description: description,
                    metadata: metadata,
                    color: color,
                    bag_type: bagType,
                    brand: brand,
                    embedding: resnetEmbedding || null,         // ResNet50 vector
                    clip_embedding: clipEmbedding || null        // CLIP vector
                })
                .select()
                .single();

            if (dbError) throw new Error(`Database insert failed: ${dbError.message}`);

            const activeModels = [resnetEmbedding && 'ResNet50', clipEmbedding && 'CLIP'].filter(Boolean);
            console.log(`✅ Record saved with embeddings: [${activeModels.join(', ') || 'none'}]`);

            return record;
        } catch (error) {
            console.error('Report Lost Luggage Error:', error);
            throw error;
        }
    }

    /**
     * findMatches - Ensemble matching
     * Uses BOTH ResNet50 + CLIP embeddings + metadata for best results
     */
    async findMatches(luggageId) {
        // 1. Get the target luggage record
        const { data: target, error: fetchError } = await supabase
            .from('luggage')
            .select('embedding, clip_embedding, color, bag_type, status')
            .eq('id', luggageId)
            .single();

        if (fetchError || !target) throw new Error('Luggage not found');
        if (!target.embedding && !target.clip_embedding) {
            throw new Error('This item has no embeddings yet');
        }

        // 2. Determine search direction (lost → search found, found → search lost)
        const searchStatus = target.status === 'lost' ? 'found' : 'lost';

        // 3. Try ensemble matching first (uses both models)
        let matches = [];
        try {
            const { data, error } = await supabase.rpc('match_luggage_ensemble', {
                query_embedding: target.embedding,
                query_clip_embedding: target.clip_embedding,
                filter_color: target.color || null,
                filter_bag_type: target.bag_type || null,
                filter_status: searchStatus,
                match_threshold: 0.50,
                match_count: 10
            });

            if (error) throw error;
            matches = data || [];
            console.log(`🎯 Ensemble matching: ${matches.length} candidates found`);
        } catch (ensembleError) {
            console.warn('⚠️ Ensemble matching failed, falling back to basic matching:', ensembleError.message);

            // Fallback to original single-embedding match
            const embedding = target.embedding || target.clip_embedding;
            const { data, error } = await supabase.rpc('match_luggage', {
                query_embedding: embedding,
                match_threshold: 0.70,
                match_count: 5
            });

            if (error) throw new Error(`Matching failed: ${error.message}`);
            matches = data || [];
        }

        // 4. Filter out self-match
        const validMatches = matches.filter(m => m.id !== luggageId);

        // 5. Persist matches to DB
        if (validMatches.length > 0) {
            const matchesToInsert = validMatches.map(m => ({
                lost_luggage_id: luggageId,
                found_luggage_id: m.id,
                similarity_score: m.similarity,
                status: 'pending'
            }));

            const { error: insertError } = await supabase
                .from('matches')
                .insert(matchesToInsert);

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
            .select('id, image_url, status, description, color, bag_type, brand, metadata, created_at')
            .eq('mongo_user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Get all matches for a user (with ensemble similarity breakdown)
     */
    async getUserMatches(userId) {
        // 1. Get user's lost luggage IDs
        const { data: userLuggage, error: luggageError } = await supabase
            .from('luggage')
            .select('id, image_url, description, color, bag_type, brand')
            .eq('mongo_user_id', userId);

        if (luggageError) throw new Error(luggageError.message);
        if (!userLuggage || userLuggage.length === 0) return [];

        const luggageMap = {};
        userLuggage.forEach(l => luggageMap[l.id] = l);
        const luggageIds = userLuggage.map(l => l.id);

        // 2. Get matches for these items
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .in('lost_luggage_id', luggageIds)
            .order('similarity_score', { ascending: false });

        if (matchError) throw new Error(matchError.message);
        if (!matches || matches.length === 0) return [];

        // 3. Get found luggage details
        const foundLuggageIds = [...new Set(matches.map(m => m.found_luggage_id))];

        const { data: foundItems, error: foundError } = await supabase
            .from('luggage')
            .select('id, image_url, description, color, bag_type, brand, status, created_at')
            .in('id', foundLuggageIds);

        if (foundError) throw new Error(foundError.message);

        const foundMap = {};
        foundItems.forEach(item => foundMap[item.id] = item);

        // 4. Merge data
        return matches.map(m => ({
            ...m,
            lost_luggage: luggageMap[m.lost_luggage_id],
            found_luggage: foundMap[m.found_luggage_id]
        })).filter(m => m.found_luggage);
    }
}

module.exports = new LuggageService();
