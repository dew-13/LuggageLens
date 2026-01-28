import React from 'react';
import { Link } from 'react-router-dom';
import '../animations.css';

import useLuggageStore from '../../store/luggageStore';

export default function MatchesHighlights() {
  const matches = useLuggageStore(state => state.matches.slice(0, 3));

  return (

    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl card-animated">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Potential Matches</h2>
        <span className="bg-white text-black px-2.5 py-1 rounded-full text-xs font-bold shadow-lg shadow-white/20">
          {matches.length}
        </span>
      </div>
      <div className="space-y-4">
        {matches.map((match, index) => (
          <div
            key={match.id}
            className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 card-animated"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${match.status === 'pending'
                ? 'bg-yellow-500/10 text-yellow-200 border-yellow-500/20'
                : 'bg-green-500/10 text-green-200 border-green-500/20'
                }`}>
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </span>
              <span className="font-bold text-sm text-white">{(match.similarity * 100).toFixed(0)}% Match</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="progress-bar-animated bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ width: `${match.similarity * 100}%` }}
              />
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No matches found yet.</p>
          </div>
        )}
        <Link to="/passenger/matches" className="block w-full mt-6 bg-white text-black font-bold text-sm py-3 rounded-xl hover:bg-gray-200 transition-colors text-center shadow-lg shadow-white/5">
          View All Matches
        </Link>
      </div>
    </div>
  );
}
