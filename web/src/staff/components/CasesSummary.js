import React from 'react';

export default function CasesSummary() {
  const cases = [
    {
      id: 1,
      type: 'lost',
      description: 'Black leather suitcase with gold handles',
      date: '2026-01-12',
      status: 'pending'
    },
    {
      id: 2,
      type: 'found',
      description: 'Red duffel bag with brown straps',
      date: '2026-01-11',
      status: 'matched'
    },
    {
      id: 3,
      type: 'lost',
      description: 'Blue backpack with laptop compartment',
      date: '2026-01-10',
      status: 'matched'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'matched':
        return 'bg-green-100 text-green-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">Recent Cases</h2>
      <div className="space-y-4">
        {cases.map((lugCase) => (
          <div key={lugCase.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    lugCase.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {lugCase.type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(lugCase.status)}`}>
                    {lugCase.status.charAt(0).toUpperCase() + lugCase.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-900 font-medium">{lugCase.description}</p>
                <p className="text-gray-500 text-sm mt-2">{new Date(lugCase.date).toLocaleDateString()}</p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
