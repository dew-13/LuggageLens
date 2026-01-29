import React, { useState } from 'react';
import PassengerNavigation from '../components/PassengerNavigation';
import TravelVerificationForm from '../components/TravelVerificationForm';
import ReportForm from '../components/ReportForm';
import ScanningLoader from '../components/ScanningLoader';
import { Link } from 'react-router-dom';
import '../animations.css';
import apiClient from '../../services/apiClient';

import useLuggageStore from '../../store/luggageStore';

export default function ReportLost() {
  // 'verification', 'report', 'retrieve' (step 3 & 4 combined as result)
  const [step, setStep] = useState('verification');
  const [verificationData, setVerificationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  const addCase = useLuggageStore(state => state.addCase);
  const setMatches = useLuggageStore(state => state.setMatches); // Get the action

  const handleVerificationComplete = (verificationResult) => {
    setVerificationData(verificationResult);
    setStep('report');
  };

  const handleVerificationCancel = () => {
    // Go back to verification step, preserving data in verificationData 
    // (TravelVerificationForm is now updated to accept initialData)
    setStep('verification');
  };

  const handleReportSubmit = async (formData) => {
    setIsLoading(true);
    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('description', formData.description);
      data.append('color', formData.color);
      data.append('brand', formData.brand);
      data.append('type', 'suitcase');

      // Add flight verification data specifically
      if (verificationData && verificationData.travelInput) {
        // Send detailed metadata as a JSON string
        data.append('metadata', JSON.stringify({
          flight: verificationData.travelInput,
          verificationScore: verificationData.score
        }));

        // Set lost_date to flight date automatically as requested
        if (verificationData.travelInput.dateOfTravel) {
          data.append('lost_date', verificationData.travelInput.dateOfTravel);
        }
      }

      if (formData.image) {
        data.append('image', formData.image);
      } else {
        alert("Please upload an image of your luggage!");
        setIsLoading(false);
        return;
      }

      // Send to backend
      const response = await apiClient.post('/luggage/report', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Report success:', response.data);

      const resultData = {
        luggage: response.data.luggage,
        matches: response.data.potentialMatches || [],
        verification: verificationData
      };

      setSubmissionResult(resultData);

      // Update local store cases
      if (response.data.luggage) {
        addCase({
          ...response.data.luggage,
          verification: verificationData
        });
      }

      // Update matches in store with formatted data for UI
      if (response.data.potentialMatches && response.data.potentialMatches.length > 0) {
        const formattedMatches = response.data.potentialMatches.map(m => ({
          id: m.id,
          lostImage: response.data.luggage.image_url,
          foundImage: m.image_url,
          similarity: m.similarity,
          status: 'pending',
          date: new Date().toISOString(),
          description: 'Potential match found by AI'
        }));
        setMatches(formattedMatches);
      } else {
        setMatches([]); // Clear previous matches if none found
      }

      // Move to 'retrieve' step (Success Screen)
      setStep('retrieve');

    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 md:pt-20 md:pl-20 relative">
      <PassengerNavigation />

      {isLoading && <ScanningLoader message="Analyzing Luggage DNA..." />}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 w-full mb-20">

        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-start justify-between w-full relative">
            {/* Step 1: Verify Travel */}
            <div className={`flex flex-col items-center relative z-10 flex-1 opacity-100`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border border-white/20 transition-all duration-300 ${step !== 'verification' ? 'bg-white text-black' : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]'}`}>
                {step !== 'verification' ? '✓' : '1'}
              </div>
              <span className="text-[10px] sm:text-xs font-medium mt-2 text-center text-white leading-tight">VERIFY<br className="sm:hidden" /> TRAVEL</span>
            </div>

            {/* Line 1-2 */}
            <div className={`flex-1 h-[1px] mt-4 sm:mt-5 transition-all duration-500 ${step !== 'verification' ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/10'}`} />

            {/* Step 2: Luggage Details */}
            <div className={`flex flex-col items-center relative z-10 flex-1 ${step !== 'verification' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border border-white/20 transition-all duration-300 ${step === 'report' || step === 'retrieve' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-gray-500'}`}>
                {step === 'retrieve' ? '✓' : '2'}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium mt-2 text-center transition-colors duration-300 leading-tight ${step === 'report' || step === 'retrieve' ? 'text-white' : 'text-gray-500'}`}>LUGGAGE<br className="sm:hidden" /> DETAILS</span>
            </div>

            {/* Line 2-3 */}
            <div className={`flex-1 h-[1px] mt-4 sm:mt-5 transition-all duration-500 ${step === 'retrieve' ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/10'}`} />

            {/* Step 3: Search (Result) */}
            <div className={`flex flex-col items-center relative z-10 flex-1 ${step === 'retrieve' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border border-white/20 transition-all duration-300 ${step === 'retrieve' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-gray-500'}`}>
                3
              </div>
              <span className={`text-[10px] sm:text-xs font-medium mt-2 text-center transition-colors duration-300 leading-tight ${step === 'retrieve' ? 'text-white' : 'text-gray-500'}`}>RESULT<br className="sm:hidden" /> & MATCH</span>
            </div>

            {/* Line 3-4 */}
            <div className={`flex-1 h-[1px] mt-4 sm:mt-5 transition-all duration-500 ${step === 'retrieve' ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/10'}`} />

            {/* Step 4: Retrieve */}
            <div className={`flex flex-col items-center relative z-10 flex-1 ${step === 'retrieve' ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base border border-white/20 transition-all duration-300 ${step === 'retrieve' ? 'bg-white/5 text-gray-500' : 'bg-white/5 text-gray-500'}`}>
                4
              </div>
              <span className={`text-[10px] sm:text-xs font-medium mt-2 text-center transition-colors duration-300 leading-tight ${step === 'retrieve' ? 'text-gray-300' : 'text-gray-500'}`}>RETRIEVE</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {step === 'verification' ? 'Report Lost Luggage' : step === 'report' ? 'Describe Your Luggage' : 'Report Analysis Result'}
          </h1>
        </div>

        {/* Step 1: Travel Verification */}
        {step === 'verification' && (
          <TravelVerificationForm
            onVerificationComplete={handleVerificationComplete}
            // Pass the previously verified data (specifically the input part) as initialData
            initialData={verificationData ? verificationData.travelInput : null}
            onCancel={() => window.location.href = '/passenger/dashboard'}
          />
        )}

        {/* Step 2: Luggage Report */}
        {step === 'report' && verificationData && (
          <div>
            {/* Verification Summary */}
            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
              <p className="text-white text-xs font-medium flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center text-[10px]">✓</span>
                Travel verified: {verificationData.flightNumber} on {verificationData.dateOfTravel}
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
              onCancel={() => window.location.href = '/passenger/dashboard'}
            />
          </div>
        )}

        {/* Step 3/4: Results */}
        {step === 'retrieve' && submissionResult && (
          <div className="bg-black/40 backdrop-blur-xl rounded-xl p-8 border border-white/10 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Report Filed Successfully!</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Your luggage has been registered. Reference ID: <span className="text-white font-mono">{submissionResult.luggage.id.split('-')[0]}</span>
            </p>

            {submissionResult.matches.length > 0 ? (
              <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-6 mb-8 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-2xl">🎉</span>
                  <h3 className="text-xl font-bold text-white">We Found Potential Matches!</h3>
                </div>
                <p className="text-gray-300 mb-6">
                  Our AI identified <strong className="text-white">{submissionResult.matches.length}</strong> items that verify closely with your luggage DNA.
                </p>
                <Link
                  to="/passenger/matches"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                >
                  View Matches Now <span className="text-lg">→</span>
                </Link>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-2">No Immediate Matches</h3>
                <p className="text-gray-400 text-sm">
                  Don't worry! Our AI is constantly scanning. We will notify you instantly when a match is found.
                </p>
              </div>
            )}

            <div className="flex justify-center gap-6 mt-8">
              <Link to="/passenger/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">Return to Dashboard</Link>
              <Link to="/passenger/cases" className="text-gray-400 hover:text-white text-sm transition-colors">Track Status</Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
