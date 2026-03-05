import { create } from 'zustand';
import apiClient from '../services/apiClient';

const useLuggageStore = create((set, get) => ({
    cases: [],
    matches: [],
    claims: [],
    loading: false,
    claimLoading: false,

    // ── Luggage Cases ──
    fetchCases: async () => {
        set({ loading: true });
        try {
            const response = await apiClient.get('/luggage/my-cases');
            set({ cases: response.data || [] });
        } catch (error) {
            console.error('Failed to fetch cases:', error);
        } finally {
            set({ loading: false });
        }
    },

    // ── Matches ──
    fetchMatches: async () => {
        set({ loading: true });
        try {
            const response = await apiClient.get('/luggage/matches');

            const formattedMatches = (response.data || []).map(m => ({
                id: m.id,
                lostLuggageId: m.lost_luggage_id,
                foundLuggageId: m.found_luggage_id,
                lostImage: m.lost_luggage?.image_url,
                foundImage: m.found_luggage?.image_url,
                foundDescription: m.found_luggage?.description || 'Potential match found',
                foundColor: m.found_luggage?.color,
                foundBagType: m.found_luggage?.bag_type,
                foundBrand: m.found_luggage?.brand,
                similarity: m.similarity_score || m.similarity,
                status: m.status,
                date: m.created_at,
                description: m.found_luggage?.description || 'Potential match found'
            }));

            set({ matches: formattedMatches });
        } catch (error) {
            console.error('Failed to fetch matches:', error);
        } finally {
            set({ loading: false });
        }
    },

    // ── Claims ──
    fetchClaims: async () => {
        set({ claimLoading: true });
        try {
            const response = await apiClient.get('/claims/my-claims');
            set({ claims: response.data || [] });
        } catch (error) {
            console.error('Failed to fetch claims:', error);
        } finally {
            set({ claimLoading: false });
        }
    },

    submitClaim: async (claimData) => {
        set({ claimLoading: true });
        try {
            const response = await apiClient.post('/claims', claimData);
            // Refresh claims after submission
            await get().fetchClaims();
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.error || 'Failed to submit claim';
            console.error('Claim submission error:', message);
            return { success: false, error: message };
        } finally {
            set({ claimLoading: false });
        }
    },

    submitAdditionalInfo: async (claimId, infoData) => {
        try {
            const response = await apiClient.put(`/claims/${claimId}/additional-info`, infoData);
            await get().fetchClaims();
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Failed to submit info' };
        }
    },

    // ── Actions ──
    addCase: (newCase) => set((state) => ({
        cases: [newCase, ...state.cases]
    })),

    setMatches: (newMatches) => set(() => ({
        matches: newMatches
    })),

    confirmMatch: (matchId) => set((state) => ({
        matches: state.matches.map(m =>
            m.id === matchId ? { ...m, status: 'confirmed' } : m
        )
    })),

    rejectMatch: (matchId) => set((state) => ({
        matches: state.matches.map(m =>
            m.id === matchId ? { ...m, status: 'rejected' } : m
        )
    }))
}));

export default useLuggageStore;
