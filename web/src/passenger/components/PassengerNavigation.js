import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import '../animations.css';

export default function PassengerNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-gray-200 shadow-sm" style={{ backgroundColor: '#ddfce6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/passenger/dashboard" className="text-base font-bold" style={{ color: '#123458' }}>
              BaggageLens
            </Link>

          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link
              to="/passenger/dashboard"
              className={`nav-item-animated font-medium text-sm transition-colors px-3 py-1 rounded ${location.pathname === '/passenger/dashboard' ? 'bg-green-100' : ''}`}
              style={{ color: '#123458' }}
            >
              Dashboard
            </Link>
            <Link
              to="/passenger/cases"
              className="nav-item-animated font-medium text-sm transition-colors"
              style={{ color: '#123458' }}
            >
              My Cases
            </Link>
            <Link
              to="/passenger/matches"
              className="nav-item-animated font-medium text-sm transition-colors"
              style={{ color: '#123458' }}
            >
              Matches
            </Link>
            <Link
              to="/passenger/report"
              className="nav-item-animated font-medium text-sm transition-colors px-3 py-1 rounded"
              style={{ color: '#123458' }}
            >
              Report Lost
            </Link>
          </div>

          {/* Profile & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-sm"
                style={{ color: '#123458' }}
              >
                <div className="ml-2 px-3 py-1 bg-green-100 text-xs font-semibold rounded-full" style={{ color: '#123458' }}>
                    
         P
                </div>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium" style={{ color: '#123458' }}>Passenger</p>
                    <p className="text-xs" style={{ color: '#123458' }}>passenger@baggage.com</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" style={{ color: '#123458' }}>
                    Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" style={{ color: '#123458' }}>
                    Settings
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm" style={{ color: '#123458' }}>
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
              style={{ color: '#123458' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 card-animated">
            <Link
              to="/passenger/dashboard"
              className={`block px-4 py-2 hover:bg-gray-50 rounded ${location.pathname === '/passenger/dashboard' ? 'bg-green-100' : ''}`}
              style={{ color: '#123458' }}
            >
              Dashboard
            </Link>
            <Link
              to="/passenger/cases"
              className="block px-4 py-2 hover:bg-gray-50 rounded"
              style={{ color: '#123458' }}
            >
              My Cases
            </Link>
            <Link
              to="/passenger/matches"
              className="block px-4 py-2 hover:bg-gray-50 rounded"
              style={{ color: '#123458' }}
            >
              Matches
            </Link>
            <Link
              to="/passenger/report"
              className="block px-4 py-2 hover:bg-blue-50 rounded font-medium"
              style={{ color: '#123458' }}
            >
              Report Lost
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
