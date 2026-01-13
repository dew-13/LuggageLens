import React, { useState, useEffect } from 'react';
import StaffNavigation from '../components/StaffNavigation';
import CasesList from '../components/CasesList';
import CaseFilters from '../components/CaseFilters';

export default function StaffCases() {
  const [cases, setCases] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    sortBy: 'recent'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, [filters]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setCases([
        {
          id: 1,
          type: 'lost',
          description: 'Black leather suitcase with gold handles',
          date: '2026-01-12',
          status: 'pending',
          image: 'https://via.placeholder.com/150'
        },
        {
          id: 2,
          type: 'found',
          description: 'Red duffel bag with brown straps',
          date: '2026-01-11',
          status: 'matched',
          image: 'https://via.placeholder.com/150'
        }
      ]);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg font-bold text-gray-900">All Cases</h1>
          <p className="text-gray-600 mt-2 text-sm">Manage and review all luggage cases reported by users.</p>
        </div>

        {/* Filters */}
        <CaseFilters filters={filters} setFilters={setFilters} />

        {/* Cases List */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading cases...</p>
            </div>
          ) : (
            <CasesList cases={cases} />
          )}
        </div>
      </main>
    </div>
  );
}
