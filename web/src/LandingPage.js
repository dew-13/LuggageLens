import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-sm text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 border-b border-white/10 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-base md:text-lg font-bold text-white tracking-wider">BaggageLens</div>
            <Link
              to="/login"
              className="bg-white text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-16">
        <div className="text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Find Your Lost Luggage
          </h1>
          <p className="text-base md:text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Using advanced AI and image recognition technology, we help reunite travelers with their lost luggage efficiently and reliably.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-white text-black px-8 py-3 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all transform hover:scale-105 shadow-lg shadow-white/10"
            >
              Get Started
            </Link>
            <button className="bg-transparent text-white border border-white/30 px-8 py-3 rounded-lg font-semibold text-sm hover:bg-white/10 transition-all backdrop-blur-sm">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-xl shadow-2xl border border-white/10 p-8 text-center hover:bg-white/10 transition-all backdrop-blur-sm group">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-3 tracking-wide">Smart Matching</h3>
            <p className="text-gray-400 text-xs leading-relaxed">AI-powered matching finds your luggage among thousands of found items.</p>
          </div>

          <div className="bg-white/5 rounded-xl shadow-2xl border border-white/10 p-8 text-center hover:bg-white/10 transition-all backdrop-blur-sm group">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-3 tracking-wide">Real-Time Tracking</h3>
            <p className="text-gray-400 text-xs leading-relaxed">Track your case status in real-time and get instant notifications.</p>
          </div>

          <div className="bg-white/5 rounded-xl shadow-2xl border border-white/10 p-8 text-center hover:bg-white/10 transition-all backdrop-blur-sm group">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-3 tracking-wide">24/7 Support</h3>
            <p className="text-gray-400 text-xs leading-relaxed">Our staff is available to assist you at every step of the process.</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-12 tracking-wide">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Report', desc: 'Report your lost luggage with details' },
              { step: '2', title: 'Search', desc: 'AI searches through found items' },
              { step: '3', title: 'Match', desc: 'Get notified when matches are found' },
              { step: '4', title: 'Retrieve', desc: 'Confirm match and arrange pickup' }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center h-full hover:bg-white/10 transition-all backdrop-blur-sm">
                  <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-4 shadow-lg shadow-white/20 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wider">{item.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-white/20 z-10">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative border-y border-white/10 bg-white/5 backdrop-blur-md py-16 mt-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl font-bold mb-4 text-white">Ready to Find Your Luggage?</h2>
          <p className="text-gray-400 mb-8 text-sm max-w-lg mx-auto">Join thousands of travelers who have successfully recovered their luggage using our BaggeLens AI.</p>
          <Link
            to="/login"
            className="inline-block bg-white text-black px-8 py-3 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all shadow-lg shadow-white/10 hover:scale-105"
          >
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/90 backdrop-blur-xl text-gray-400 py-12 text-xs border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">BaggageLens</h4>
              <p className="leading-relaxed text-gray-500">Finding lost luggage with advanced AI technology.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm tracking-wider uppercase">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-600">&copy; 2026 BaggageLens. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
