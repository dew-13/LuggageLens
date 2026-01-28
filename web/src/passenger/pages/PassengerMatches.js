import React from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import PassengerMatchesList from '../components/PassengerMatchesList';
import baggageClaimImage from '../../images/baggage claim.jpg';
import '../animations.css';

import useLuggageStore from '../../store/luggageStore';

export default function PassengerMatches() {
  const matches = useLuggageStore(state => state.matches);

  return (
    <div
      className="min-h-screen pt-16 relative"
      style={{
        backgroundImage: `url('${baggageClaimImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better text readability */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(16, 46, 74, 0.9)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <PassengerNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 card-animated" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-lg font-bold text-white">My Matches</h1>
          <p className="text-white mt-2 text-sm">Review potential matches for your lost luggage.</p>
        </div>

        {/* Matches List */}
        <div className="card-animated" style={{ animationDelay: '0.2s' }}>
          <PassengerMatchesList matches={matches} />
        </div>
      </main>
    </div>
  );
}
