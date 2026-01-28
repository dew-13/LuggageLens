import React from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import MyCasesList from '../components/MyCasesList';

import '../animations.css';

import useLuggageStore from '../../store/luggageStore';

export default function MyCases() {
  const cases = useLuggageStore(state => state.cases);

  return (
    <div className="min-h-screen pt-16 relative">
      <PassengerNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 card-animated" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-lg font-bold text-white">My Cases</h1>
          <p className="text-gray-400 mt-2 text-sm">View and manage all your luggage reports.</p>
        </div>

        {/* Cases List */}
        <div className="card-animated" style={{ animationDelay: '0.2s' }}>
          <MyCasesList cases={cases} />
        </div>
      </main>
    </div>
  );
}
