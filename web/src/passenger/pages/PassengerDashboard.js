import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PassengerNavigation from '../components/PassengerNavigation';
import MyLuggageSummary from '../components/MyLuggageSummary';
import MatchesHighlights from '../components/MatchesHighlights';
import heroImage from '../../images/hero.avif';
import '../animations.css';

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    lostReports: 0,
    foundMatches: 0,
    pendingCases: 0,
    resolvedCases: 0
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  // Mouse tracking for interactive animation
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Normalize mouse position to -1 to 1 range
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;
      
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <PassengerNavigation />
      
      {/* Hero Section */}
      <div 
        className="relative overflow-hidden" 
        style={{ 
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          position: 'relative',
          minHeight: '500px'
        }}
      >
        {/* Overlay for better text readability */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(16, 46, 74, 0.75)',
            zIndex: 1
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Welcome to BaggageLens
            </h1>
            <p className="text-lg md:text-xl text-white mb-10 max-w-3xl mx-auto" style={{ color: '#b7b7b7' }}>
              Lost your luggage? Don't worry. Our AI-powered system helps you find your missing baggage quickly and efficiently.
            </p>
            <Link
              to="/passenger/report"
              className="inline-block btn-animated px-8 py-4 rounded-lg text-lg font-semibold text-green-100 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: '#345770' }}
            >
              Find My Luggage
            </Link>
          </div>
        </div>
        
        {/* Interactive Floating Luggage Icons */}
        <div 
          className="absolute pointer-events-none"
          style={{ 
            top: '20%', 
            right: '10%',
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
            transition: 'transform 0.3s ease-out',
            zIndex: 2
          }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" opacity="0.15">
            <rect x="20" y="30" width="80" height="60" rx="8" fill="white" stroke="white" strokeWidth="3"/>
            <rect x="30" y="40" width="60" height="40" rx="4" fill="transparent" stroke="white" strokeWidth="2"/>
            <rect x="45" y="20" width="30" height="15" rx="4" fill="white"/>
            <circle cx="35" cy="95" r="8" fill="white"/>
            <circle cx="85" cy="95" r="8" fill="white"/>
            <line x1="40" y1="55" x2="80" y2="55" stroke="white" strokeWidth="2"/>
            <line x1="40" y1="65" x2="80" y2="65" stroke="white" strokeWidth="2"/>
          </svg>
        </div>

        <div 
          className="absolute pointer-events-none"
          style={{ 
            top: '60%', 
            left: '15%',
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -25}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" opacity="0.12">
            <rect x="15" y="25" width="70" height="50" rx="6" fill="white" stroke="white" strokeWidth="2.5"/>
            <rect x="25" y="33" width="50" height="34" rx="3" fill="transparent" stroke="white" strokeWidth="1.5"/>
            <rect x="38" y="15" width="24" height="12" rx="3" fill="white"/>
            <circle cx="28" cy="78" r="6" fill="white"/>
            <circle cx="72" cy="78" r="6" fill="white"/>
          </svg>
        </div>

        <div 
          className="absolute pointer-events-none hidden lg:block"
          style={{ 
            top: '40%', 
            left: '8%',
            transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 20}px) rotate(${mousePosition.x * 5}deg)`,
            transition: 'transform 0.4s ease-out'
          }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" opacity="0.1">
            <rect x="12" y="20" width="56" height="40" rx="5" fill="white" stroke="white" strokeWidth="2"/>
            <rect x="20" y="27" width="40" height="26" rx="2" fill="transparent" stroke="white" strokeWidth="1.5"/>
            <rect x="30" y="13" width="20" height="10" rx="2.5" fill="white"/>
            <circle cx="24" cy="63" r="5" fill="white"/>
            <circle cx="56" cy="63" r="5" fill="white"/>
          </svg>
        </div>

        <div 
          className="absolute pointer-events-none hidden lg:block"
          style={{ 
            top: '25%', 
            right: '25%',
            transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * 35}px) rotate(${mousePosition.x * -8}deg)`,
            transition: 'transform 0.35s ease-out'
          }}
        >
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none" opacity="0.08">
            <rect x="14" y="22" width="62" height="46" rx="6" fill="white" stroke="white" strokeWidth="2.5"/>
            <rect x="23" y="30" width="44" height="30" rx="3" fill="transparent" stroke="white" strokeWidth="1.5"/>
            <rect x="33" y="14" width="24" height="11" rx="3" fill="white"/>
            <circle cx="27" cy="71" r="6" fill="white"/>
            <circle cx="63" cy="71" r="6" fill="white"/>
          </svg>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f1f1f1', borderWidth: '1px', borderColor: '#2596be' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#2596be' }}>Reports Filed</p>
                <p className="stat-number text-3xl font-bold mt-2" style={{ color: '#345770' }}>{stats.lostReports}</p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#2596be20' }}>
                <svg className="w-6 h-6" style={{ color: '#2596be' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="stat-card rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f1f1f1', borderWidth: '1px', borderColor: '#2596be' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#b7b7b7' }}>Found Matches</p>
                <p className="stat-number text-3xl font-bold mt-2" style={{ color: '#345770' }}>{stats.foundMatches}</p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#2596be20' }}>
                <svg className="w-6 h-6" style={{ color: '#2596be' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card bg-white rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f1f1f1', borderWidth: '1px', borderColor: '#2596be' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#b7b7b7' }}>Pending Cases</p>
                <p className="stat-number text-3xl font-bold mt-2" style={{ color: '#345770' }}>{stats.pendingCases}</p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#34577020' }}>
                <svg className="w-6 h-6" style={{ color: '#345770' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card rounded-lg shadow-sm p-6" style={{ backgroundColor: '#f1f1f1', borderWidth: '1px', borderColor: '#2596be' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#b7b7b7' }}>Resolved Cases</p>
                <p className="stat-number text-3xl font-bold mt-2" style={{ color: '#345770' }}>{stats.resolvedCases}</p>
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
