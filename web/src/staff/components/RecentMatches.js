import React from 'react';

export default function RecentMatches() {
  const matches = [
    {
      id: 1,
      similarity: 0.94,
      status: 'pending'
    },
    {
      id: 2,
      similarity: 0.87,
      status: 'confirmed'
    },
    {
      id: 3,
      similarity: 0.91,
      status: 'pending'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">Recent Matches</h2>
      <div className="space-y-3">
        {matches.map((match) => (
          <div key={match.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
              </span>
              <span className="text-green-600 font-bold text-sm">{(match.similarity * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${match.similarity * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
