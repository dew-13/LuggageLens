import { create } from 'zustand';

const useLuggageStore = create((set) => ({
    cases: [
        {
            id: 1,
            description: 'Black leather suitcase with gold handles',
            date: '2026-01-12',
            status: 'pending',
            color: 'Black',
            brand: 'Samsonite',
            location: 'JFK Airport',
            contact: '555-0123'
        },
        {
            id: 2,
            description: 'Red duffel bag with brown straps',
            date: '2026-01-11',
            status: 'matched',
            color: 'Red',
            brand: 'Nike',
            location: 'LHR Airport',
            contact: '555-0124'
        }
    ],
    matches: [
        {
            id: 1,
            lostImage: 'https://placehold.co/300x200/png?text=Lost+Bag',
            foundImage: 'https://placehold.co/300x200/png?text=Found+Match',
            similarity: 0.94,
            status: 'pending',
            date: '2026-01-12',
            description: 'Black leather suitcase match'
        },
        {
            id: 2,
            lostImage: 'https://placehold.co/300x200/png?text=Lost+Red+Bag',
            foundImage: 'https://placehold.co/300x200/png?text=Found+Red+Match',
            similarity: 0.87,
            status: 'confirmed',
            date: '2026-01-11',
            description: 'Red backpack match'
        }
    ],

    addCase: (newCase) => set((state) => ({
        cases: [
            {
                id: state.cases.length + 1,
                status: 'pending',
                ...newCase
            },
            ...state.cases
        ]
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
