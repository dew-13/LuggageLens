const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

/**
 * Claims API — Passenger Side
 * 
 * Handles the claim lifecycle from the passenger's perspective:
 * 1. Submit a claim for a matched found bag
 * 2. View claim statuses
 * 3. Provide additional info if requested by staff
 */

/**
 * POST /api/claims
 * Submit a claim for a found luggage match
 * 
 * Body: {
 *   lostLuggageId: uuid,
 *   foundLuggageId: uuid,
 *   similarityScore: float,
 *   passengerName: string,
 *   flightNumber: string,
 *   travelDate: string (YYYY-MM-DD),
 *   bagDescription: string,
 *   contactEmail: string,
 *   contactPhone: string,
 *   proofOfOwnership: string (URL, optional)
 * }
 */
router.post('/', auth, async (req, res) => {
    try {
        const {
            lostLuggageId,
            foundLuggageId,
            similarityScore,
            passengerName,
            flightNumber,
            travelDate,
            bagDescription,
            contactEmail,
            contactPhone,
            proofOfOwnership
        } = req.body;

        if (!lostLuggageId || !foundLuggageId) {
            return res.status(400).json({ error: 'lostLuggageId and foundLuggageId are required' });
        }

        // Verify the lost luggage belongs to this user
        const { data: lostItem, error: verifyError } = await supabase
            .from('luggage')
            .select('id, mongo_user_id')
            .eq('id', lostLuggageId)
            .eq('mongo_user_id', req.user.id)
            .single();

        if (verifyError || !lostItem) {
            return res.status(403).json({ error: 'Lost luggage not found or not yours' });
        }

        // Check if found item is still active (not already claimed by someone else)
        const { data: foundItem, error: foundError } = await supabase
            .from('luggage')
            .select('id, is_active, status')
            .eq('id', foundLuggageId)
            .eq('status', 'found')
            .eq('is_active', true)
            .single();

        if (foundError || !foundItem) {
            return res.status(409).json({ error: 'This item has already been claimed or is no longer available' });
        }

        // Check for duplicate claim
        const { data: existingClaim } = await supabase
            .from('claims')
            .select('id, status')
            .eq('lost_luggage_id', lostLuggageId)
            .eq('found_luggage_id', foundLuggageId)
            .not('status', 'eq', 'rejected')
            .maybeSingle();

        if (existingClaim) {
            return res.status(409).json({
                error: 'You already have an active claim for this item',
                claimId: existingClaim.id,
                status: existingClaim.status
            });
        }

        // Create the claim
        const { data: claim, error: claimError } = await supabase
            .from('claims')
            .insert({
                lost_luggage_id: lostLuggageId,
                found_luggage_id: foundLuggageId,
                similarity_score: similarityScore || null,
                passenger_name: passengerName,
                flight_number: flightNumber,
                travel_date: travelDate || null,
                bag_description: bagDescription,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                proof_of_ownership: proofOfOwnership || null,
                status: 'pending_verification'
            })
            .select()
            .single();

        if (claimError) {
            throw new Error(`Failed to create claim: ${claimError.message}`);
        }

        console.log(`📋 New claim created: ${claim.id} (lost: ${lostLuggageId} → found: ${foundLuggageId})`);

        res.status(201).json({
            message: 'Claim submitted successfully! Staff will review your request.',
            claim
        });

    } catch (error) {
        console.error('Create Claim Error:', error);
        res.status(500).json({ error: error.message });
    }
});


/**
 * GET /api/claims/my-claims
 * Get all claims for the authenticated passenger
 */
router.get('/my-claims', auth, async (req, res) => {
    try {
        // Get user's lost luggage IDs
        const { data: userLuggage, error: luggageError } = await supabase
            .from('luggage')
            .select('id')
            .eq('mongo_user_id', req.user.id);

        if (luggageError) throw new Error(luggageError.message);
        if (!userLuggage || userLuggage.length === 0) {
            return res.json([]);
        }

        const luggageIds = userLuggage.map(l => l.id);

        // Get claims with related luggage details
        const { data: claims, error: claimsError } = await supabase
            .from('claims')
            .select('*')
            .in('lost_luggage_id', luggageIds)
            .order('created_at', { ascending: false });

        if (claimsError) throw new Error(claimsError.message);

        // Enrich with luggage details
        const foundIds = [...new Set(claims.map(c => c.found_luggage_id))];
        const lostIds = [...new Set(claims.map(c => c.lost_luggage_id))];
        const allIds = [...new Set([...foundIds, ...lostIds])];

        const { data: luggageDetails } = await supabase
            .from('luggage')
            .select('id, image_url, description, color, bag_type, brand, status')
            .in('id', allIds);

        const luggageMap = {};
        if (luggageDetails) {
            luggageDetails.forEach(l => luggageMap[l.id] = l);
        }

        const enrichedClaims = claims.map(claim => ({
            ...claim,
            lost_luggage: luggageMap[claim.lost_luggage_id] || null,
            found_luggage: luggageMap[claim.found_luggage_id] || null,
            // Human-readable status
            status_label: getStatusLabel(claim.status)
        }));

        res.json(enrichedClaims);

    } catch (error) {
        console.error('Get My Claims Error:', error);
        res.status(500).json({ error: error.message });
    }
});


/**
 * PUT /api/claims/:id/additional-info
 * Passenger provides additional info requested by staff
 */
router.put('/:id/additional-info', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { bagDescription, proofOfOwnership, additionalNotes } = req.body;

        // Verify claim belongs to this user's luggage
        const { data: claim, error: fetchError } = await supabase
            .from('claims')
            .select('*, luggage!claims_lost_luggage_id_fkey(mongo_user_id)')
            .eq('id', id)
            .single();

        if (fetchError || !claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        const updates = {};
        if (bagDescription) updates.bag_description = bagDescription;
        if (proofOfOwnership) updates.proof_of_ownership = proofOfOwnership;
        if (claim.status === 'more_info_needed') {
            updates.status = 'pending_verification'; // Back to review queue
        }

        const { data: updatedClaim, error: updateError } = await supabase
            .from('claims')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw new Error(updateError.message);

        res.json({
            message: 'Additional information submitted',
            claim: updatedClaim
        });

    } catch (error) {
        console.error('Additional Info Error:', error);
        res.status(500).json({ error: error.message });
    }
});


// Helper: human-readable status labels
function getStatusLabel(status) {
    const labels = {
        'pending_verification': '⏳ Pending Verification',
        'under_review': '🔍 Under Review',
        'more_info_needed': '⚠️ More Information Needed',
        'verified': '✅ Verified — Ownership Confirmed',
        'ready_for_dispatch': '📦 Ready for Dispatch',
        'dispatched': '🚚 Dispatched — In Transit',
        'delivered': '✅ Delivered',
        'rejected': '❌ Claim Rejected'
    };
    return labels[status] || status;
}

module.exports = router;
