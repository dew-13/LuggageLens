import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PassengerNavigation from '../components/PassengerNavigation';
import MyLuggageSummary from '../components/MyLuggageSummary';
import MatchesHighlights from '../components/MatchesHighlights';
import baggageBeltVideo from '../../images/baggage belt.mp4';
// import heroImage from '../../images/hero.avif';
import '../animations.css';

import useLuggageStore from '../../store/luggageStore';

export default function PassengerDashboard() {
  const cases = useLuggageStore(state => state.cases);
  const matches = useLuggageStore(state => state.matches);

  const stats = {
    lostReports: cases.length,
    foundMatches: matches.length,
    pendingCases: cases.filter(c => c.status === 'pending').length,
    resolvedCases: cases.filter(c => c.status === 'resolved' || c.status === 'matched').length
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
      <PassengerNavigation />

      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{
          position: 'relative',
          minHeight: '500px'
        }}
      >
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        >
          <source src={baggageBeltVideo} type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          Your browser does not support the video tag.
        </video>

        {/* Overlay for better text readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(16, 46, 74, 0.5)',
            zIndex: 1
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-32 lg:py-60 relative z-10 mt-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ background: 'linear-gradient(135deg, #10ff66 0%, #00d4ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Welcome to BaggageLens
            </h1>
            <p className="text-base md:text-xl text-white mb-10 max-w-3xl mx-auto" style={{ color: '#e0e0e0' }}>
              Lost your luggage? <br className="hidden md:block" />Our AI-powered system helps you find your missing baggage quickly and efficiently.
            </p>
            <Link
              to="/passenger/report"
              className="inline-block btn-animated px-8 py-4 rounded-lg text-lg font-semibold transform hover:scale-105 transition-all duration-200"
              style={{
                background: 'rgba(20, 40, 60, 0.4)',
                backgroundImage: 'linear-gradient(rgba(20, 40, 60, 0.4), rgba(20, 40, 60, 0.4)), linear-gradient(135deg, #10ff66 0%, #00d4ff 100%)',
                backgroundClip: 'padding-box, border-box',
                backgroundOrigin: 'padding-box, border-box',
                border: '2px solid transparent',
                color: '#e0e0e0',
                boxShadow: '0 0 20px rgba(16, 255, 102, 0.3), 0 0 40px rgba(0, 212, 255, 0.2)',
                position: 'relative',
                opacity: 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(16, 255, 102, 0.6), 0 0 60px rgba(0, 212, 255, 0.4), 0 0 80px rgba(16, 255, 102, 0.3)';
                e.currentTarget.style.color = '#10ff66';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 255, 102, 0.3), 0 0 40px rgba(0, 212, 255, 0.2)';
                e.currentTarget.style.color = '#e0e0e0';
                e.currentTarget.style.opacity = '0.8';
              }}
            >
              Find My Luggage
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
