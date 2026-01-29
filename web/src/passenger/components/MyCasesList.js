import React from 'react';
import { Link } from 'react-router-dom';
import '../animations.css';

export default function MyCasesList({ cases }) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Reported</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {cases.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                  No cases reported yet.
                </td>
              </tr>
            ) : (
              cases.map((lugCase, index) => (
                <tr key={lugCase.id} className="table-row-animated hover:bg-white/5 transition-colors" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-6 py-4 text-sm text-white font-medium">{lugCase.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(lugCase.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge-animated px-2 py-1 rounded text-xs font-semibold inline-block ${lugCase.status === 'pending' ? 'bg-yellow-500/20 text-yellow-200' :
                      lugCase.status === 'matched' ? 'bg-green-500/20 text-green-200' :
                        'bg-white/20 text-white'
                      }`}>
                      {lugCase.status.charAt(0).toUpperCase() + lugCase.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/passenger/cases/${lugCase.id}`}
                      className="text-white hover:text-gray-300 font-semibold text-xs transition-colors hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {cases.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No cases reported yet.
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {cases.map((lugCase, index) => (
              <div
                key={lugCase.id}
                className="bg-white/5 rounded-lg border border-white/10 p-4 shadow-sm card-animated backdrop-blur-md"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`status-badge-animated px-2 py-1 rounded text-xs font-semibold inline-block ${lugCase.status === 'pending' ? 'bg-yellow-500/20 text-yellow-200' :
                    lugCase.status === 'matched' ? 'bg-green-500/20 text-green-200' :
                      'bg-white/20 text-white'
                    }`}>
                    {lugCase.status.charAt(0).toUpperCase() + lugCase.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(lugCase.date).toLocaleDateString()}</span>
                </div>
                <h3 className="font-medium text-white mb-3">{lugCase.description}</h3>
                <Link
                  to={`/passenger/cases/${lugCase.id}`}
                  className="block w-full py-2.5 text-center text-white font-medium text-sm border border-white/20 rounded hover:bg-white/10 transition-colors"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
