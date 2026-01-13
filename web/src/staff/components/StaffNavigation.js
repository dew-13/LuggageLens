import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function StaffNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/staff/dashboard" className="text-base font-bold text-blue-600">
              BaggageLens
            </Link>
            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              Staff
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link
              to="/staff/dashboard"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/staff/cases"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Cases
            </Link>
            <Link
              to="/staff/matches"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Matches
            </Link>
            <Link
              to="/staff/users"
              className="text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
            >
              Users
            </Link>
          </div>

          {/* Profile & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative">
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
                  <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm">
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <Link
              to="/staff/dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
            >
              Dashboard
            </Link>
            <Link
              to="/staff/cases"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
            >
              Cases
            </Link>
            <Link
              to="/staff/matches"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
            >
              Matches
            </Link>
            <Link
              to="/staff/users"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded"
            >
              Users
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
