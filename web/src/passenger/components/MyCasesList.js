import React from 'react';
import '../animations.css';

export default function MyCasesList({ cases }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reported</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cases.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No cases reported yet.
                </td>
              </tr>
            ) : (
              cases.map((lugCase, index) => (
                <tr key={lugCase.id} className="table-row-animated hover:bg-gray-50 transition-colors" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-6 py-4 text-sm text-gray-900">{lugCase.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(lugCase.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge-animated px-2 py-1 rounded text-xs font-semibold inline-block ${lugCase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        lugCase.status === 'matched' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                      }`}>
                      {lugCase.status.charAt(0).toUpperCase() + lugCase.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs transition-colors hover:underline">ViewDetails</button>
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
          <div className="p-4 text-center text-gray-500">
            No cases reported yet.
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {cases.map((lugCase, index) => (
              <div
                key={lugCase.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm card-animated"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`status-badge-animated px-2 py-1 rounded text-xs font-semibold inline-block ${lugCase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      lugCase.status === 'matched' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {lugCase.status.charAt(0).toUpperCase() + lugCase.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(lugCase.date).toLocaleDateString()}</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{lugCase.description}</h3>
                <button className="w-full mt-2 py-2 text-center text-blue-600 font-medium text-sm border border-blue-200 rounded hover:bg-blue-50 transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
