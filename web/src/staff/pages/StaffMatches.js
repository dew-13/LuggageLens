import React, { useState, useEffect } from 'react';
import StaffNavigation from '../components/StaffNavigation';
import MatchesList from '../components/MatchesList';

export default function StaffMatches() {
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    try {
      // TODO: Replace with actual API call
      setMatches([
        {
          id: 1,
          lostImage: 'https://via.placeholder.com/150',
          foundImage: 'https://via.placeholder.com/150',
          similarity: 0.94,
          status: 'pending',
          date: '2026-01-12'
        },
        {
          id: 2,
          lostImage: 'https://via.placeholder.com/150',
          foundImage: 'https://via.placeholder.com/150',
          similarity: 0.87,
          status: 'confirmed',
          date: '2026-01-11'
        }
      ]);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg font-bold text-gray-900">Luggage Matches</h1>
          <p className="text-gray-600 mt-2 text-sm">Review and confirm matching luggage pairs.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['all', 'pending', 'confirmed', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                filter === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Matches List */}
        <MatchesList matches={matches} />
      </main>
    </div>
  );
}
