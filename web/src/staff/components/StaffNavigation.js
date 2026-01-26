import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function StaffNavigation() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
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
            <Link to="/staff/dashboard" className="text-base font-bold text-white drop-shadow-md">
              BaggageLens
            </Link>
            <span className="ml-2 px-3 py-1 text-white text-xs font-semibold drop-shadow-md">
              Staff
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link
              to="/staff/dashboard"
              className="text-white drop-shadow-md font-medium text-sm transition-colors hover:text-blue-300"
            >
              Dashboard
            </Link>
            <Link
              to="/staff/cases"
              className="text-white drop-shadow-md font-medium text-sm transition-colors hover:text-blue-300"
            >
              Cases
            </Link>
            <Link
              to="/staff/matches"
              className="text-white drop-shadow-md font-medium text-sm transition-colors hover:text-blue-300"
            >
              Matches
            </Link>
            <Link
              to="/staff/users"
              className="text-white drop-shadow-md font-medium text-sm transition-colors hover:text-blue-300"
            >
              Users
            </Link>
          </div>

          {/* Profile & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Profile Dropdown - Desktop Only */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  S
                </div>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-medium text-gray-900">Staff Member</p>
                    <p className="text-xs text-gray-600">staff@baggage.com</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm">
                    Settings
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm">
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
          <div className="md:hidden py-4 bg-slate-800 border-t border-slate-600">
            <div className="px-4 py-2 mb-4 text-white border-b border-slate-600 pb-4 font-medium">
              Staff Portal
            </div>
            <Link
              to="/staff/dashboard"
              className="block px-4 py-2 text-white rounded transition-colors hover:bg-slate-700"
            >
              Dashboard
            </Link>
            <Link
              to="/staff/cases"
              className="block px-4 py-2 text-white rounded transition-colors hover:bg-slate-700"
            >
              Cases
            </Link>
            <Link
              to="/staff/matches"
              className="block px-4 py-2 text-white rounded transition-colors hover:bg-slate-700"
            >
              Matches
            </Link>
            <Link
              to="/staff/users"
              className="block px-4 py-2 text-white rounded transition-colors hover:bg-slate-700"
            >
              Users
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
