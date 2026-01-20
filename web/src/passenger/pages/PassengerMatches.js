import React, { useState, useEffect } from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import PassengerMatchesList from '../components/PassengerMatchesList';
import '../animations.css';

export default function PassengerMatches() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchMatches();
  }, []);

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
          date: '2026-01-12',
          description: 'Black leather suitcase match'
        },
        {
          id: 2,
          lostImage: 'https://via.placeholder.com/150',
          foundImage: 'https://via.placeholder.com/150',
          similarity: 0.87,
          status: 'confirmed',
          date: '2026-01-11',
          description: 'Red backpack match'
        }
      ]);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PassengerNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 card-animated" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-lg font-bold text-gray-900">My Matches</h1>
          <p className="text-gray-600 mt-2 text-sm">Review potential matches for your lost luggage.</p>
        </div>

        {/* Matches List */}
        <div className="card-animated" style={{ animationDelay: '0.2s' }}>
          <PassengerMatchesList matches={matches} />
        </div>
      </main>
    </div>
  );
}
