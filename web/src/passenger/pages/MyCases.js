import React from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import MyCasesList from '../components/MyCasesList';

import '../animations.css';

import useLuggageStore from '../../store/luggageStore';

export default function MyCases() {
  const cases = useLuggageStore(state => state.cases);
  const fetchCases = useLuggageStore(state => state.fetchCases);

  React.useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return (
    <div className="min-h-screen relative pt-16 md:pt-20 md:pl-20">
      <PassengerNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 card-animated" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">My Cases</h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">View and manage all your luggage reports.</p>
        </div>

        {/* Cases List */}
        <div className="card-animated" style={{ animationDelay: '0.2s' }}>
          <MyCasesList cases={cases} />
        </div>
      </main>
    </div>
  );
}
