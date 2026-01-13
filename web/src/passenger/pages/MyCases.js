import React, { useState, useEffect } from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import MyCasesList from '../components/MyCasesList';

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
          image: 'https://via.placeholder.com/150'
        },
        {
          id: 2,
          description: 'Red duffel bag with brown straps',
          date: '2026-01-11',
          status: 'matched',
          image: 'https://via.placeholder.com/150'
        }
      ]);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PassengerNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg font-bold text-gray-900">My Cases</h1>
          <p className="text-gray-600 mt-2 text-sm">View and manage all your luggage reports.</p>
        </div>

        {/* Cases List */}
        <MyCasesList cases={cases} />
      </main>
    </div>
  );
}
