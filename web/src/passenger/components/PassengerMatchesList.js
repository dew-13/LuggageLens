import React, { useState } from 'react';
import '../animations.css';

export default function PassengerMatchesList({ matches }) {
  const [confirmedMatches, setConfirmedMatches] = useState({});

  const handleConfirm = (matchId) => {
    setConfirmedMatches(prev => ({
      ...prev,
      [matchId]: true
    }));
    // TODO: Send API request to confirm match
  };

  const handleReject = (matchId) => {
    setConfirmedMatches(prev => ({
      ...prev,
      [matchId]: false
    }));
    // TODO: Send API request to reject match
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.length === 0 ? (
        <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center card-animated">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">No matches found yet. Please be patient while we search.</p>
        </div>
      ) : (
        matches.map((match, index) => (
          <div 
            key={match.id} 
            className="card-animated bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {/* Images */}
            <div className="grid grid-cols-2 gap-0 h-48 bg-gray-100 match-image-pair">
              <div className="relative overflow-hidden">
                <img src={match.lostImage} alt="Lost" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-semibold">
                  Your Item
                </div>
              </div>
              <div className="relative overflow-hidden">
                <img src={match.foundImage} alt="Found" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-semibold">
                  Found Item
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">{match.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className={`status-badge-animated px-2 py-1 rounded text-xs font-semibold inline-block ${
                  match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  match.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                </span>
                <span className="match-similarity-score text-green-600 font-bold text-sm">{(match.similarity * 100).toFixed(0)}%</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="progress-bar-animated bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${match.similarity * 100}%` }}
                  />
                </div>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-600 mb-4">{new Date(match.date).toLocaleDateString()}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleConfirm(match.id)}
                  className="btn-animated flex-1 bg-blue-600 text-white py-2 px-3 rounded font-medium text-xs hover:bg-blue-700 transition-colors"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => handleReject(match.id)}
                  className="btn-animated flex-1 bg-gray-200 text-gray-900 py-2 px-3 rounded font-medium text-xs hover:bg-gray-300 transition-colors"
                >
                  Not a Match
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
