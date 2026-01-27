import React from 'react';
import { Link } from 'react-router-dom';
import '../animations.css';

import useLuggageStore from '../../store/luggageStore';

export default function MatchesHighlights() {
  const matches = useLuggageStore(state => state.matches.slice(0, 3));

  return (
    <div className="card-animated bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold" style={{ color: '#133458' }}>Potential Matches</h2>
        <span className="status-badge-animated bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold inline-block">
          {matches.length}
        </span>
      </div>
      <div className="space-y-3">
        {matches.map((match, index) => (
          <div
            key={match.id}
            className="card-animated border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`status-badge-animated px-2 py-1 rounded text-xs font-semibold inline-block ${match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </span>
              <span className=" font-bold text-sm" style={{ color: '#133458' }}>{(match.similarity * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="progress-bar-animated bg-green-500 h-2 rounded-full"
                style={{ width: `${match.similarity * 100}%` }}
              />
            </div>
          </div>
        ))}
        <Link to="/passenger/matches" className="block w-full mt-4 hover:text-blue-800 font-medium text-sm py-2 border border-blue-200 rounded-lg transition-colors text-center" style={{ color: '#133458' }}>
          View All Matches
        </Link>
      </div>
    </div>
  );
}
