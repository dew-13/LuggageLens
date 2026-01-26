import React, { useState, useEffect } from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import PassengerMatchesList from '../components/PassengerMatchesList';
import baggageClaimImage from '../../images/baggage claim.jpg';
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
          lostImage: '',
          foundImage: '',
          similarity: 0.94,
          status: 'pending',
          date: '2026-01-12',
          description: 'Black leather suitcase match'
        },
        {
          id: 2,
          lostImage: '',
          foundImage: '',
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
