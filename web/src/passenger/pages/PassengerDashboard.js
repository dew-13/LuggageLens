import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PassengerNavigation from '../components/PassengerNavigation';
import MyLuggageSummary from '../components/MyLuggageSummary';
import MatchesHighlights from '../components/MatchesHighlights';
import '../animations.css';
import GlobeHero3D from '../components/GlobeHero3D';

export default function PassengerDashboard() {
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

  return (
    <div className="min-h-screen relative pt-16 md:pt-20 md:pl-20">
      <PassengerNavigation />



      {/* Hero Section */}
      <div className="relative z-10 py-4 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center min-h-[400px] lg:min-h-0">

            {/* 3D Globe - Background on Mobile, Right Side on Desktop */}
            <div className="absolute inset-x-0 top-0 h-[400px] z-0 opacity-60 lg:opacity-100 lg:static lg:order-2 lg:h-[600px] lg:w-full">
              <GlobeHero3D />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent lg:hidden pointer-events-none" />
            </div>

            {/* Content - Overlay on Mobile, Left Side on Desktop */}
            <div className="relative z-10 text-left space-y-6 pt-24 lg:pt-0 lg:order-1 pointer-events-none lg:pointer-events-auto">
              <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-gray-300 backdrop-blur-md mb-2 pointer-events-auto">
                ✨ Next Generation Tracking
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
                Global <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">Luggage Recovery</span>
              </h1>
              <p className="text-base lg:text-lg text-gray-400 max-w-xl leading-relaxed">
                Advanced AI algorithms that scan, match, and locate your missing items across thousands of airports worldwide.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 pointer-events-auto">
                <Link
                  to="/passenger/report"
                  className="px-8 py-4 bg-white text-black rounded-full font-bold text-sm tracking-wide hover:bg-gray-200 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
                >
                  Start Recovery <span className="text-lg">→</span>
                </Link>
                <Link
                  to="/passenger/cases"
                  className="px-8 py-4 border border-white/20 text-white rounded-full font-bold text-sm tracking-wide hover:bg-white/10 transition-all"
                >
                  Track Status
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Reports Filed', value: stats.lostReports, icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { label: 'Found Matches', value: stats.foundMatches, icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
            { label: 'Pending Cases', value: stats.pendingCases, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Resolved Cases', value: stats.resolvedCases, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors card-animated" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{stat.label}</p>
                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
