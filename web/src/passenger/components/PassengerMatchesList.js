import React, { useState } from 'react';
import '../animations.css';
import ClaimModal from './ClaimModal';

export default function PassengerMatchesList({ matches }) {
  const [selectedMatch, setSelectedMatch] = useState(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.length === 0 ? (
          <div className="col-span-full bg-black/40 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-12 text-center card-animated">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-bold text-white mb-2">No Matches Found Yet</h3>
            <p className="text-gray-400">Our AI keeps scanning automatically.<br />We'll notify you when a potential match appears.</p>
          </div>
        ) : (
          matches.map((match, index) => (
            <div
              key={match.id}
              className="card-animated bg-black/40 backdrop-blur-md rounded-xl shadow-xl border border-white/10 overflow-hidden hover:border-white/30 transition-all duration-300"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Images */}
              <div className="grid grid-cols-2 gap-px bg-black h-48 opacity-90">
                <div className="relative overflow-hidden group">
                  <img src={match.lostImage} alt="Lost" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border border-white/10">
                    Your Item
                  </div>
                </div>
                <div className="relative overflow-hidden group">
                  <img src={match.foundImage} alt="Found" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase border border-white/10">
                    Found Item
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${match.status === 'pending'
                    ? 'bg-yellow-500/10 text-yellow-200 border-yellow-500/20'
                    : match.status === 'confirmed'
                      ? 'bg-green-500/10 text-green-200 border-green-500/20'
                      : 'bg-red-500/10 text-red-200 border-red-500/20'
                    }`}>
                    {match.status}
                  </span>
                  <span className="text-white font-bold text-sm">{(match.similarity * 100).toFixed(0)}% Match</span>
                </div>

                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{match.description}</p>

                {/* Metadata tags */}
                {(match.foundColor || match.foundBagType || match.foundBrand) && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {match.foundColor && (
                      <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/5">
                        {match.foundColor}
                      </span>
                    )}
                    {match.foundBagType && (
                      <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/5">
                        {match.foundBagType}
                      </span>
                    )}
                    {match.foundBrand && (
                      <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/5">
                        {match.foundBrand}
                      </span>
                    )}
                  </div>
                )}

                {/* Similarity Bar */}
                <div className="mb-4">
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="progress-bar-animated h-full rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                      style={{
                        width: `${match.similarity * 100}%`,
                        background: match.similarity >= 0.85
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : match.similarity >= 0.7
                            ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                            : 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      }}
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 mb-5">
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-xs text-gray-400">{new Date(match.date).toLocaleDateString()}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 px-3 rounded-lg font-bold text-xs hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                  >
                    🔒 Claim This Bag
                  </button>
                  <button
                    className="flex-1 bg-transparent text-gray-400 border border-white/20 py-2.5 px-3 rounded-lg font-bold text-xs hover:bg-white/5 hover:text-white transition-all active:scale-95"
                  >
                    Not a Match
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Claim Modal */}
      {selectedMatch && (
        <ClaimModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </>
  );
}
