import React from 'react';
import { Link } from 'react-router-dom';
import '../animations.css';

export default function MyLuggageSummary() {
  const cases = [
    {
      id: 1,
      description: 'Black leather suitcase with gold handles',
      date: '2026-01-12',
      status: 'pending'
    },
    {
      id: 2,
      description: 'Red duffel bag with brown straps',
      date: '2026-01-11',
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
    <div className="card-animated rounded-lg shadow-sm p-6" style={{ backgroundColor: '#102e4a', borderWidth: '1px', borderColor: '#2596be' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-100">My Luggage Reports</h2>
        <Link
          to="/passenger/report"
          className="btn-animated bg-green-100 text-green-800 px-3 py-1 rounded font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Report Lost
        </Link>
      </div>
      <div className="space-y-4">
        {cases.map((lugCase, index) => (
          <div 
            key={lugCase.id} 
            className="card-animated border border-gray-200 rounded-lg p-4 hover:text-green-100 transition-colors"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`status-badge-animated px-2 py-1 rounded text-xs font-semibold inline-block ${getStatusColor(lugCase.status)}`}>
                    {lugCase.status.charAt(0).toUpperCase() + lugCase.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-400 font-medium">{lugCase.description}</p>
                <p className="text-gray-500 text-sm mt-2">{new Date(lugCase.date).toLocaleDateString()}</p>
              </div>
              <Link to={`/passenger/cases/${lugCase.id}`} className="text-green-100 hover:text-green-700 font-medium text-sm transition-colors">
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
