import React, { useState } from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import TravelVerificationForm from '../components/TravelVerificationForm';
import ReportForm from '../components/ReportForm';
import '../animations.css';

export default function ReportLost() {
  const [step, setStep] = useState('verification'); // 'verification' or 'report'
  const [verificationData, setVerificationData] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleVerificationComplete = (verificationResult) => {
    // Store verification data for luggage report
    setVerificationData(verificationResult);
    // Move to next step
    setStep('report');
  };

  const handleVerificationCancel = () => {
    // Reset everything
    setStep('verification');
    setVerificationData(null);
  };

  const handleReportSubmit = async (formData) => {
    try {
      // Combine verification data with luggage report data
      const completeReport = {
        ...formData,
        verification: verificationData,
      };

      console.log('Submitting complete report with verification:', completeReport);
      
      // TODO: Replace with actual API call to backend
      // POST to /api/report-lost-luggage with completeReport
      
      setSubmitted(true);
      setTimeout(() => {
        // Reset after success
        setSubmitted(false);
        setStep('verification');
        setVerificationData(null);
      }, 5000);
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PassengerNavigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex flex-col items-center ${step === 'verification' ? '' : 'opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                step === 'verification' ? 'bg-blue-600' : 'bg-gray-400'
              }`}>
                1
              </div>
              <p className="text-sm mt-2 text-gray-700">Travel Verification</p>
            </div>
            
            <div className={`flex-1 h-1 mx-4 ${step === 'report' ? 'bg-blue-600' : 'bg-gray-300'}`} />
            
            <div className={`flex flex-col items-center ${step === 'report' ? '' : 'opacity-60'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                step === 'report' ? 'bg-blue-600' : 'bg-gray-400'
              }`}>
                2
              </div>
              <p className="text-sm mt-2 text-gray-700">Luggage Details</p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'verification' ? 'Report Lost Luggage' : 'Describe Your Luggage'}
          </h1>
          <p className="text-gray-600 mt-2 text-sm">
            {step === 'verification' 
              ? 'First, verify your travel details to expedite the recovery process.'
              : 'Now tell us about your lost luggage so we can help find it.'}
          </p>
        </div>

        {submitted && (
          <div className="mb-6 success-message bg-green-50 border border-green-200 rounded-lg p-4" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 font-medium">
                ✓ Report submitted successfully! Our staff will review your verified travel details and luggage description.
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Travel Verification */}
        {step === 'verification' && (
          <TravelVerificationForm 
            onVerificationComplete={handleVerificationComplete}
            onCancel={handleVerificationCancel}
          />
        )}

        {/* Step 2: Luggage Report */}
        {step === 'report' && verificationData && (
          <div>
            {/* Verification Summary */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 text-sm font-medium">
                ✓ Travel verified: {verificationData.travelData.flightNumber} on {verificationData.travelData.dateOfTravel}
              </p>
              <button
                onClick={handleVerificationCancel}
                className="text-blue-600 text-sm underline mt-2 hover:text-blue-800"
              >
                Edit travel details
              </button>
            </div>

            <ReportForm 
              onSubmit={handleReportSubmit}
              verificationData={verificationData}
            />
          </div>
        )}
      </main>
    </div>
  );
}
