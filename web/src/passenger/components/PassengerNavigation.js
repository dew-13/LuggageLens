import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import '../animations.css';

export default function PassengerNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/passenger/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      path: '/passenger/cases',
      label: 'My Cases',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      path: '/passenger/matches',
      label: 'Matches',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      path: '/passenger/report',
      label: 'Report Lost',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Desktop Header (Logo Only) */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 items-center px-6 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <Link to="/passenger/dashboard" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
          <span className="font-bold text-xl tracking-tight">BaggageLens</span>
        </Link>
      </header>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-16 bottom-0 flex-col bg-black/20 backdrop-blur-sm z-50 transition-all duration-300 ease-in-out w-16 hover:w-64 group">
        {/* Navigation Links */}
        <div className="flex-1 flex flex-col gap-4 py-6 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group/item overflow-hidden whitespace-nowrap relative ${isActive
                  ? 'bg-white text-black shadow-lg shadow-white/20'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-black/20" />
                )}

                <div className={`w-6 h-6 min-w-[1.5rem] flex items-center justify-center transition-transform duration-300 ${!isActive && 'group-hover/item:scale-110'}`}>
                  {item.icon}
                </div>

                <span className={`font-medium text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 delay-75`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Profile / Logout Section */}
        <div className="p-2 mb-4">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 min-w-[2rem] rounded-full bg-white flex items-center justify-center text-black border border-white/10 shadow-lg">
              <span className="font-bold text-xs">{user?.email?.[0]?.toUpperCase() || 'P'}</span>
            </div>

            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
              <p className="text-sm font-semibold text-white truncate max-w-[120px]">{user?.email || 'Passenger'}</p>
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300 text-left mt-0.5 flex items-center gap-1"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Navigation (Original Style) */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/passenger/dashboard" className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                BaggageLens
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="py-4 border-t border-white/10 space-y-2 animate-in slide-in-from-top-4 duration-200">
              <div className="px-4 py-2 mb-2 flex items-center gap-3 text-white border-b border-white/10 pb-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                  <span className="font-bold text-xs">{user?.email?.[0]?.toUpperCase() || 'P'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Passenger Account</span>
                  <span className="text-xs text-gray-400">{user?.email || 'passenger@baggage.com'}</span>
                </div>
              </div>
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path ? 'bg-white text-black' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                >
                  <div className="w-5 h-5">{item.icon}</div>
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 hover:text-red-300 text-sm mt-2 rounded-lg transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
