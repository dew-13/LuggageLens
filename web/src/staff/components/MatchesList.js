import React from 'react';

export default function MatchesList({ matches }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.length === 0 ? (
        <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No matches found</p>
        </div>
      ) : (
        matches.map((match) => (
          <div key={match.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Images */}
            <div className="grid grid-cols-2 gap-0 h-48 bg-gray-100">
              <img src={match.lostImage} alt="Lost" className="w-full h-full object-cover" />
              <img src={match.foundImage} alt="Found" className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  match.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                </span>
                <span className="text-green-600 font-bold text-xs">{(match.similarity * 100).toFixed(0)}%</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${match.similarity * 100}%` }}
                  />
                </div>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-600 mb-4">{new Date(match.date).toLocaleDateString()}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded font-semibold text-xs hover:bg-green-700 transition-colors">
                  Confirm
                </button>
                <button className="flex-1 bg-gray-200 text-gray-900 py-2 px-3 rounded font-semibold text-xs hover:bg-gray-300 transition-colors">
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
