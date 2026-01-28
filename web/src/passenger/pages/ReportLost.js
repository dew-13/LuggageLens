import React, { useState } from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import TravelVerificationForm from '../components/TravelVerificationForm';
import ReportForm from '../components/ReportForm';
import '../animations.css';

import useLuggageStore from '../../store/luggageStore';

export default function ReportLost() {
  const [step, setStep] = useState('verification'); // 'verification' or 'report'
  const [verificationData, setVerificationData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const addCase = useLuggageStore(state => state.addCase);

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
        date: new Date().toISOString(),
        status: 'pending'
      };

      console.log('Submitting complete report with verification:', completeReport);

      // Update local store state
      addCase(completeReport);

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
    <div className="min-h-screen pt-16 md:pt-20 md:pl-20 relative">
      <PassengerNavigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between w-full relative">
            {/* Step 1: Verify Travel */}
            <div className={`flex flex-col items-center relative z-10 ${step === 'verification' || step === 'report' || submitted ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border border-white/20 transition-all duration-300 ${step === 'verification' || step === 'report' || submitted ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-gray-500'
                }`}>
                {step === 'report' || submitted ? '✓' : '1'}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium mt-3 text-center transition-colors duration-300 ${step === 'verification' || step === 'report' || submitted ? 'text-white' : 'text-gray-500'
                }`}>VERIFY TRAVEL</span>
            </div>

            {/* Line 1-2 */}
            <div className={`flex-1 h-[1px] mx-2 sm:mx-4 transition-all duration-500 ${step === 'report' || submitted ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/10'}`} />

            {/* Step 2: Luggage Details */}
            <div className={`flex flex-col items-center relative z-10 ${step === 'report' || submitted ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border border-white/20 transition-all duration-300 ${step === 'report' || submitted ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-gray-500'
                }`}>
                {submitted ? '✓' : '2'}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium mt-3 text-center transition-colors duration-300 ${step === 'report' || submitted ? 'text-white' : 'text-gray-500'
                }`}>LUGGAGE DETAILS</span>
            </div>

            {/* Line 2-3 */}
            <div className={`flex-1 h-[1px] mx-2 sm:mx-4 transition-all duration-500 ${submitted ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/10'}`} />

            {/* Step 3: Search & Match */}
            <div className={`flex flex-col items-center relative z-10 ${submitted ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border border-white/20 transition-all duration-300 ${submitted ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-gray-500'
                }`}>
                3
              </div>
              <span className={`text-[10px] sm:text-xs font-medium mt-3 text-center transition-colors duration-300 ${submitted ? 'text-white' : 'text-gray-500'
                }`}>SEARCH & MATCH</span>
            </div>

            {/* Line 3-4 */}
            <div className="flex-1 h-[1px] mx-2 sm:mx-4 bg-white/10" />

            {/* Step 4: Retrieve */}
            <div className="flex flex-col items-center relative z-10 opacity-50">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border border-white/20 bg-white/5 text-gray-500">
                4
              </div>
              <span className="text-[10px] sm:text-xs font-medium mt-3 text-center text-gray-500">RETRIEVE</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {step === 'verification' ? 'Report Lost Luggage' : 'Describe Your Luggage'}
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            {step === 'verification'
              ? 'First, verify your travel details to expedite the recovery process.'
              : 'Now tell us about your lost luggage so we can help find it.'}
          </p>
        </div>

        {submitted && (
          <div className="mb-6 success-message bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-md" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-white font-medium">
                Report submitted successfully! Our staff will review your verified travel details and luggage description.
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
            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
              <p className="text-white text-xs font-medium flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center text-[10px]">✓</span>
                Travel verified: {verificationData.travelData.flightNumber} on {verificationData.travelData.dateOfTravel}
              </p>
              <button
                onClick={handleVerificationCancel}
                className="text-gray-400 text-xs underline mt-2 hover:text-white transition-colors ml-6"
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
