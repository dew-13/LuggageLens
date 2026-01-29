import { create } from 'zustand';
import apiClient from '../services/apiClient';

const useLuggageStore = create((set) => ({
    cases: [],
    matches: [],
    loading: false,

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

    fetchMatches: async () => {
        set({ loading: true });
        try {
            const response = await apiClient.get('/luggage/matches');

            // Transform backend match data to UI format
            const formattedMatches = (response.data || []).map(m => ({
                id: m.id, // Match Record ID
                lostImage: m.lost_luggage?.image_url,
                foundImage: m.found_luggage?.image_url,
                similarity: m.similarity,
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
