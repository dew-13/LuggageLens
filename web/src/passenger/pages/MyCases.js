import React, { useState, useEffect } from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import MyCasesList from '../components/MyCasesList';
import baggageClaimImage from '../../images/baggage claim.jpg';

import '../animations.css';

export default function MyCases() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      // TODO: Replace with actual API call
      setCases([
        {
          id: 1,
          description: 'Black leather suitcase with gold handles',
          date: '2026-01-12',
          status: 'pending',
          image: ''
        },
        {
          id: 2,
          description: 'Red duffel bag with brown straps',
          date: '2026-01-11',
          status: 'matched',
          image: ''
        }
      ]);
    } catch (error) {
      console.error('Error fetching cases:', error);
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
          <h1 className="text-lg font-bold text-white">My Cases</h1>
          <p className="text-white mt-2 text-sm">View and manage all your luggage reports.</p>
        </div>

        {/* Cases List */}
        <div className="card-animated" style={{ animationDelay: '0.2s' }}>
          <MyCasesList cases={cases} />
        </div>
      </main>
    </div>
  );
}
