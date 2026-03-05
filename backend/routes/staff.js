const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const axios = require('axios');

/**
 * Staff Portal API
 * 
 * Handles the staff/admin side of luggage recovery:
 * 1. View and manage claim requests
 * 2. Update claim statuses through the verification lifecycle
 * 3. Add new found luggage (triggers watchlist auto-matching)
 * 4. View dashboard statistics
 * 
 * NOTE: In production, add staff authentication middleware.
 * For now, these endpoints are accessible for demo purposes.
 */

const RESNET_SERVICE_URL = 'http://127.0.0.1:8000/embed-url';

// ============================================================
// CLAIMS MANAGEMENT
// ============================================================

/**
 * GET /api/staff/claims
 * View all claims, optionally filtered by status
 * 
 * Query params:
 *   ?status=pending_verification (optional filter)
 *   ?page=1&limit=20 (pagination)
 */
router.get('/claims', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('claims')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('status', status);
        }

        const { data: claims, error, count } = await query;
        if (error) throw new Error(error.message);

        // Enrich with luggage details
        const allLuggageIds = [
            ...new Set([
                ...claims.map(c => c.lost_luggage_id),
                ...claims.map(c => c.found_luggage_id)
            ])
        ];

        const { data: luggageItems } = await supabase
            .from('luggage')
            .select('id, image_url, description, color, bag_type, brand, status, mongo_user_id')
            .in('id', allLuggageIds);

        const luggageMap = {};
        if (luggageItems) {
            luggageItems.forEach(l => luggageMap[l.id] = l);
        }

        const enrichedClaims = claims.map(claim => ({
            ...claim,
            lost_luggage: luggageMap[claim.lost_luggage_id] || null,
            found_luggage: luggageMap[claim.found_luggage_id] || null
        }));

        res.json({
            claims: enrichedClaims,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });

    } catch (error) {
        console.error('Get Claims Error:', error);
        res.status(500).json({ error: error.message });
    }
});


/**
 * GET /api/staff/claims/:id
 * View detailed claim information
 */
router.get('/claims/:id', async (req, res) => {
    try {
        const { data: claim, error } = await supabase
            .from('claims')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        // Get luggage details
        const { data: luggageItems } = await supabase
            .from('luggage')
            .select('*')
            .in('id', [claim.lost_luggage_id, claim.found_luggage_id]);

        const luggageMap = {};
        if (luggageItems) {
            luggageItems.forEach(l => luggageMap[l.id] = l);
        }

        res.json({
            ...claim,
            lost_luggage: luggageMap[claim.lost_luggage_id] || null,
            found_luggage: luggageMap[claim.found_luggage_id] || null
        });

    } catch (error) {
        console.error('Get Claim Detail Error:', error);
        res.status(500).json({ error: error.message });
    }
});


/**
 * PUT /api/staff/claims/:id
 * Update claim status (the core staff workflow)
 * 
 * Body: {
 *   status: 'under_review' | 'verified' | 'ready_for_dispatch' | 'dispatched' | 'delivered' | 'rejected' | 'more_info_needed',
 *   staffNotes: string (optional),
 *   reviewedBy: string (staff name),
 *   dispatchTracking: string (tracking number, for dispatched status)
 * }
 */
router.put('/claims/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, staffNotes, reviewedBy, dispatchTracking } = req.body;

        const validStatuses = [
            'pending_verification', 'under_review', 'more_info_needed',
            'verified', 'ready_for_dispatch', 'dispatched', 'delivered', 'rejected'
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Build update object
        const updates = { status };
        if (staffNotes) updates.staff_notes = staffNotes;
        if (reviewedBy) updates.reviewed_by = reviewedBy;
        if (dispatchTracking) updates.dispatch_tracking = dispatchTracking;

        const { data: updatedClaim, error: updateError } = await supabase
            .from('claims')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw new Error(updateError.message);

        // When delivered: deactivate the found luggage (remove from matching pool)
        if (status === 'delivered') {
            await supabase
                .from('luggage')
                .update({ is_active: false })
                .eq('id', updatedClaim.found_luggage_id);

            // Also mark the lost luggage as resolved
            await supabase
                .from('luggage')
                .update({ status: 'resolved', is_active: false })
                .eq('id', updatedClaim.lost_luggage_id);

            console.log(`✅ Claim ${id} delivered. Luggage removed from active matching pool.`);
        }

        // When rejected: no changes to luggage — it stays available for other claims
        if (status === 'rejected') {
            console.log(`❌ Claim ${id} rejected. Found luggage remains available.`);
        }

        res.json({
            message: `Claim status updated to: ${status}`,
            claim: updatedClaim
        });

    } catch (error) {
        console.error('Update Claim Error:', error);
        res.status(500).json({ error: error.message });
    }
});


// ============================================================
// FOUND ITEMS MANAGEMENT
// ============================================================

/**
 * GET /api/staff/found-items
 * View all active found items
 */
router.get('/found-items', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('luggage')
            .select('id, image_url, description, color, bag_type, brand, status, is_active, created_at')
            .eq('status', 'found')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        res.json(data || []);

    } catch (error) {
        console.error('Get Found Items Error:', error);
        res.status(500).json({ error: error.message });
    }
});


/**
 * POST /api/staff/found-items
 * Staff logs a new found luggage item
 * 
 * This triggers automatic watchlist matching:
 * After adding the found bag, the system checks ALL active lost items
 * for matches. If matches found, they're returned so staff can notify passengers.
 * 
 * Body (multipart/form-data):
 *   image: File
 *   description: string
 *   color: string
 *   bagType: string
 *   brand: string (optional)
 *   location: string (where it was found)
 */
router.post('/found-items', async (req, res) => {
    try {
        const { description, color, bagType, brand, location } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ error: 'Image is required' });
        }

        // 1. Upload image to Supabase Storage
        const fileName = `found-${Date.now()}.${imageFile.originalname.split('.').pop()}`;
        const filePath = `found/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('luggage-images')
            .upload(filePath, imageFile.buffer, {
                contentType: imageFile.mimetype,
                upsert: false
            });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
            .from('luggage-images')
            .getPublicUrl(filePath);

        // 2. Generate embeddings (ResNet50 + CLIP from combined API)
        let resnetEmbedding = null;
        let clipEmbedding = null;

        try {
            const response = await axios.post(RESNET_SERVICE_URL, { imageUrl: publicUrl }, { timeout: 30000 });
            resnetEmbedding = response.data.embedding;
            clipEmbedding = response.data.clip_embedding || null;
            console.log('✅ Embeddings generated for new found item');
        } catch (aiError) {
            console.warn('⚠️ AI embedding failed:', aiError.message);
        }

        // 3. Insert into database
        const { data: record, error: dbError } = await supabase
            .from('luggage')
            .insert({
                image_url: publicUrl,
                status: 'found',
                is_active: true,
                description: description || null,
                color: color || null,
                bag_type: bagType || null,
                brand: brand || null,
                metadata: { location: location || 'Unknown', added_by: 'staff' },
                embedding: resnetEmbedding,
                clip_embedding: clipEmbedding
            })
            .select()
            .single();

        if (dbError) throw new Error(`DB insert failed: ${dbError.message}`);

        // 4. Auto-check watchlist: find matching lost items
        let watchlistMatches = [];
        try {
            const { data: matches, error: matchError } = await supabase
                .rpc('check_watchlist_matches', {
                    new_found_id: record.id,
                    match_threshold: 0.60,
                    match_count: 5
                });

            if (!matchError && matches) {
                watchlistMatches = matches;
                if (matches.length > 0) {
                    console.log(`🔔 Watchlist alert! ${matches.length} lost items match this new found bag`);
                }
            }
        } catch (watchlistError) {
            console.warn('⚠️ Watchlist check failed:', watchlistError.message);
        }

        res.status(201).json({
            message: 'Found item added successfully',
            record,
            watchlistMatches: watchlistMatches.map(m => ({
                lostId: m.lost_id,
                imageUrl: m.lost_image_url,
                description: m.lost_description,
                userId: m.lost_user_id,
                similarity: Math.round(m.similarity * 100) + '%'
            })),
            watchlistAlert: watchlistMatches.length > 0
                ? `🔔 ${watchlistMatches.length} passenger(s) may be looking for this bag!`
                : 'No matching lost items in watchlist'
        });

    } catch (error) {
        console.error('Add Found Item Error:', error);
        res.status(500).json({ error: error.message });
    }
});


/**
 * DELETE /api/staff/found-items/:id
 * Manually deactivate a found item (e.g., claimed outside the system)
 */
router.delete('/found-items/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('luggage')
            .update({ is_active: false })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        res.json({ message: 'Item removed from active found pool', record: data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ============================================================
// DASHBOARD STATS
// ============================================================

/**
 * GET /api/staff/dashboard
 * Get overview statistics for the staff dashboard
 */
router.get('/dashboard', async (req, res) => {
    try {
        // Count active found items
        const { count: foundCount } = await supabase
            .from('luggage')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'found')
            .eq('is_active', true);

        // Count active lost items (watchlist)
        const { count: lostCount } = await supabase
            .from('luggage')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'lost')
            .eq('is_active', true);

        // Count claims by status
        const { data: claims } = await supabase
            .from('claims')
            .select('status');

        const claimStats = {};
        if (claims) {
            claims.forEach(c => {
                claimStats[c.status] = (claimStats[c.status] || 0) + 1;
            });
        }

        // Count resolved
        const { count: resolvedCount } = await supabase
            .from('luggage')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'resolved');

        res.json({
            activeLostItems: lostCount || 0,
            activeFoundItems: foundCount || 0,
            resolvedItems: resolvedCount || 0,
            claims: {
                total: claims ? claims.length : 0,
                ...claimStats
            }
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
