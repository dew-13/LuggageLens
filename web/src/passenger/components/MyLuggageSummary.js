import React from 'react';
import { Link } from 'react-router-dom';
import '../animations.css';

import useLuggageStore from '../../store/luggageStore';

export default function MyLuggageSummary() {
  const cases = useLuggageStore(state => state.cases.slice(0, 3));

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-200 border border-yellow-500/20';
      case 'matched':
        return 'bg-green-500/10 text-green-200 border border-green-500/20';
      case 'resolved':
        return 'bg-blue-500/10 text-blue-200 border border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-300 border border-gray-500/20';
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl card-animated">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">My Luggage Reports</h2>
        <Link
          to="/passenger/report"
          className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
        >
          Report Lost
        </Link>
      </div>
      <div className="space-y-4">
        {cases.map((lugCase, index) => (
          <div
            key={lugCase.id}
            className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 card-animated"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(lugCase.status)}`}>
                    {lugCase.status.charAt(0).toUpperCase() + lugCase.status.slice(1)}
                  </span>
                </div>
                <p className="text-white font-medium group-hover:text-white/90 transition-colors">{lugCase.description}</p>
                <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(lugCase.date).toLocaleDateString()}
                </p>
              </div>
              <Link to={`/passenger/cases/${lugCase.id}`} className="text-sm font-medium text-white/70 hover:text-white border-b border-white/30 hover:border-white transition-all">
                View Details
              </Link>
            </div>
          </div>
        ))}
        {cases.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
