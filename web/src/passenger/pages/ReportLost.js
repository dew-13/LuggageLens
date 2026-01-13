import React, { useState } from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import ReportForm from '../components/ReportForm';

export default function ReportLost() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      // TODO: Replace with actual API call
      console.log('Submitting report:', formData);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PassengerNavigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg font-bold text-gray-900">Report Lost Luggage</h1>
          <p className="text-gray-600 mt-2 text-sm">Provide details about your lost luggage to help us find it.</p>
        </div>

        {submitted && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">✓ Report submitted successfully! Our staff will review your case shortly.</p>
          </div>
        )}

        <ReportForm onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
