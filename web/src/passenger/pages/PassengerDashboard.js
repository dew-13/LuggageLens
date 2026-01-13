import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PassengerNavigation from '../components/PassengerNavigation';
import MyLuggageSummary from '../components/MyLuggageSummary';
import MatchesHighlights from '../components/MatchesHighlights';

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    lostReports: 0,
    foundMatches: 0,
    pendingCases: 0,
    resolvedCases: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Replace with actual API call
      setStats({
        lostReports: 2,
        foundMatches: 1,
        pendingCases: 1,
        resolvedCases: 2
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFindLuggage = () => {
    navigate('/passenger/report-lost');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <PassengerNavigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#102e4a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Welcome to BaggageLens
            </h1>
            <p className="text-lg md:text-xl text-white mb-10 max-w-3xl mx-auto" style={{ color: '#b7b7b7' }}>
              Lost your luggage? Don't worry. Our AI-powered system helps you find your missing baggage quickly and efficiently.
            </p>
            <button
              onClick={handleFindLuggage}
              className="px-8 py-4 rounded-lg text-lg font-semibold text-green-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: '#345770' }}
            >
              Find My Luggage
            </button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-10">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
            <circle cx="150" cy="150" r="150" fill="white" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 opacity-10">
          <svg width="250" height="250" viewBox="0 0 250 250" fill="none">
            <circle cx="125" cy="125" r="125" fill="white" />
          </svg>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f1f1f1', borderWidth: '1px', borderColor: '#2596be' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#2596be' }}>Reports Filed</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#345770' }}>{stats.lostReports}</p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#2596be20' }}>
                <svg className="w-6 h-6" style={{ color: '#2596be' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f1f1f1', borderWidth: '1px', borderColor: '#2596be' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#b7b7b7' }}>Found Matches</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#345770' }}>{stats.foundMatches}</p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#2596be20' }}>
                <svg className="w-6 h-6" style={{ color: '#2596be' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f1f1f1', borderWidth: '1px', borderColor: '#2596be' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#b7b7b7' }}>Pending Cases</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#345770' }}>{stats.pendingCases}</p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#34577020' }}>
                <svg className="w-6 h-6" style={{ color: '#345770' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f1f1f1', borderWidth: '1px', borderColor: '#2596be' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#b7b7b7' }}>Resolved Cases</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#345770' }}>{stats.resolvedCases}</p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#2596be20' }}>
                <svg className="w-6 h-6" style={{ color: '#2596be' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m0 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MyLuggageSummary />
          </div>
          <div>
            <MatchesHighlights />
          </div>
        </div>
      </main>
    </div>
  );
}
