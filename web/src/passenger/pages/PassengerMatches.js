import React from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import PassengerMatchesList from '../components/PassengerMatchesList';
import '../animations.css';

import useLuggageStore from '../../store/luggageStore';

export default function PassengerMatches() {
  const matches = useLuggageStore(state => state.matches);
  const fetchMatches = useLuggageStore(state => state.fetchMatches);

  React.useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return (
    <div className="min-h-screen relative pt-16 md:pt-20 md:pl-20">
      <PassengerNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 card-animated" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">My Matches</h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">Review potential matches for your lost luggage.</p>
        </div>

        {/* Matches List */}
        <div className="card-animated" style={{ animationDelay: '0.2s' }}>
          <PassengerMatchesList matches={matches} />
        </div>
      </main>
    </div>
  );
}
