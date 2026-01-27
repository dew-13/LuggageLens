import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import '../animations.css';

export default function PassengerNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`border-transparent fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-slate-900/70 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/passenger/dashboard" className="text-base font-bold text-white drop-shadow-md">
              BaggageLens
            </Link>

          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link
              to="/passenger/dashboard"
              className={`nav-item-animated font-medium text-sm transition-colors text-white drop-shadow-md ${location.pathname === '/passenger/dashboard' ? 'text-green-300' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/passenger/cases"
              className={`nav-item-animated font-medium text-sm transition-colors text-white drop-shadow-md ${location.pathname === '/passenger/cases' ? 'text-green-300' : ''}`}
            >
              My Cases
            </Link>
            <Link
              to="/passenger/matches"
              className={`nav-item-animated font-medium text-sm transition-colors text-white drop-shadow-md ${location.pathname === '/passenger/matches' ? 'text-green-300' : ''}`}
            >
              Matches
            </Link>
            <Link
              to="/passenger/report"
              className={`nav-item-animated font-medium text-sm transition-colors px-3 py-1 rounded text-white drop-shadow-md ${location.pathname === '/passenger/report' ? 'text-green-300' : ''}`}
            >
              Report Lost
            </Link>
          </div>

          {/* Profile & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Profile Dropdown - Desktop Only */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-sm text-white drop-shadow-md"
              >
                <div className="ml-2 p-1.5 text-white drop-shadow-md">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium" style={{ color: '#123458' }}>Passenger</p>
                    <p className="text-xs" style={{ color: '#123458' }}>{user?.email || 'passenger@baggage.com'}</p>
                  </div>
                  <Link to="/passenger/profile" className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" style={{ color: '#123458' }}>
                    Profile
                  </Link>

                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm" style={{ color: '#123458' }}>
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white drop-shadow-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-slate-800 border-t border-slate-600 card-animated">
            <div className="px-4 py-2 mb-4 flex items-center gap-2 text-white border-b border-slate-600 pb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Passenger</span>
            </div>
            <Link
              to="/passenger/dashboard"
              className={`block px-4 py-2 rounded text-white transition-colors hover:bg-slate-700 ${location.pathname === '/passenger/dashboard' ? 'bg-blue-600' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/passenger/cases"
              className={`block px-4 py-2 rounded text-white transition-colors hover:bg-slate-700 ${location.pathname === '/passenger/cases' ? 'bg-blue-600' : ''}`}
            >
              My Cases
            </Link>
            <Link
              to="/passenger/matches"
              className={`block px-4 py-2 rounded text-white transition-colors hover:bg-slate-700 ${location.pathname === '/passenger/matches' ? 'bg-blue-600' : ''}`}
            >
              Matches
            </Link>
            <Link
              to="/passenger/report"
              className={`block px-4 py-2 rounded font-medium text-white transition-colors hover:bg-slate-700 ${location.pathname === '/passenger/report' ? 'bg-blue-600' : ''}`}
            >
              Report Lost
            </Link>
            <Link
              to="/passenger/profile"
              className={`block px-4 py-2 rounded text-white transition-colors hover:bg-slate-700 ${location.pathname === '/passenger/profile' ? 'bg-blue-600' : ''}`}
            >
              Profile
            </Link>

            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-300 hover:bg-slate-700 text-sm mt-2 rounded transition-colors">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
