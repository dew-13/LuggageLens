import React, { useState } from 'react';
import { verifyTravelDetails } from '../services/TravelVerificationService';
import { fetchFlightRoute } from '../services/AviationstackService';
import { AIRPORTS as ALL_AIRPORTS } from '../data/airports';
import { AIRLINES as ALL_AIRLINES } from '../data/airlines';
import '../animations.css';

// Deduplicate data to prevent unique key errors in React
const AIRPORTS = [...new Map(ALL_AIRPORTS.map(item => [item.code, item])).values()]
  .sort((a, b) => a.name.localeCompare(b.name));

const AIRLINES = [...new Map(ALL_AIRLINES.map(item => [item.code, item])).values()]
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * TravelVerificationForm Component
 * Step 1: Collect and verify travel identifiers before luggage reporting
 * 
 * Required fields: Last name, flight number, date of travel, origin, destination
 * Optional fields: Baggage tag, PNR, ticket number, passport (for identity confirmation)
 */
const TravelVerificationForm = ({ onVerificationComplete, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    lastName: '',
    airline: '',
    flightNumber: '',
    dateOfTravel: '',
    originAirport: '',
    destinationAirport: '',
    baggageTag: '',
    pnr: '',
    ticketNumber: '',
    passportNumber: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Validation functions
  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s'-]+$/; // Only letters, spaces, hyphens, apostrophes
    return nameRegex.test(name) && name.trim().length > 0;
  };

  const validateDateOfTravel = (date) => {
    if (!date) return false;
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate <= today; // Must be today or in past (NOT future)
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...validationErrors };

    // Real-time validation
    if (name === 'lastName') {
      if (value && !validateName(value)) {
        newErrors[name] = 'Only letters, spaces, hyphens, and apostrophes allowed';
      } else {
        delete newErrors[name];
      }
    }

    if (name === 'dateOfTravel') {
      if (value && !validateDateOfTravel(value)) {
        newErrors[name] = 'Travel date cannot be in the future';
      } else {
        delete newErrors[name];
      }
    }

    setValidationErrors(newErrors);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleFlightDetailsChange = (e) => {
    const { name, value } = e.target;
    const newErrors = { ...validationErrors };

    // Real-time validation
    if (name === 'lastName' && value) {
      if (!validateName(value)) {
        newErrors[name] = 'Only letters, spaces, hyphens, and apostrophes allowed';
      } else {
        delete newErrors[name];
      }
    }

    if (name === 'dateOfTravel' && value) {
      if (!validateDateOfTravel(value)) {
        newErrors[name] = 'Travel date cannot be in the future';
      } else {
        delete newErrors[name];
      }
    }

    setValidationErrors(newErrors);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setSuccessMessage(null);
  };

  const fetchAndAutoFillAirports = async (airline, flightNumber, dateOfTravel) => {
    if (isFetchingRoute) return; // Prevent multiple simultaneous requests

    setIsFetchingRoute(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log('🔍 [AUTO-FILL] Starting fetch for:', airline, flightNumber, dateOfTravel);

      const flightRoute = await fetchFlightRoute(airline, flightNumber, dateOfTravel);

      if (flightRoute && flightRoute.originAirport && flightRoute.destinationAirport) {
        console.log('✅ [AUTO-FILL] Successfully fetched route:', flightRoute.originAirport, '→', flightRoute.destinationAirport);
        setFormData(prev => ({
          ...prev,
          originAirport: flightRoute.originIata || flightRoute.originAirport,
          destinationAirport: flightRoute.destinationIata || flightRoute.destinationAirport
        }));
        setError(null);
        // Success message removed as per user request
        setSuccessMessage(null);
      } else {
        console.log('⚠️ [AUTO-FILL] No route data received');
        setError('❌ Could not find flight information. Please enter airports manually or try a different flight.');
      }
    } catch (err) {
      console.error('❌ [AUTO-FILL] Error fetching flight route:', err);
      setError(`❌ Error fetching flight details: ${err.message}. Please try again or enter airports manually.`);
    } finally {
      setIsFetchingRoute(false);
    }
  };

  const handleManualFetchClick = async () => {
    // Validate that all required fields are filled
    const newErrors = {};

    if (!formData.airline?.trim()) {
      newErrors.airline = 'Airline is required';
    }
    if (!formData.flightNumber?.trim()) {
      newErrors.flightNumber = 'Flight number is required';
    }
    if (!formData.dateOfTravel) {
      newErrors.dateOfTravel = 'Date of travel is required';
    } else if (!validateDateOfTravel(formData.dateOfTravel)) {
      newErrors.dateOfTravel = 'Travel date cannot be in the future';
    }

    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setError('⚠️ Please fix the errors above');
      return;
    }

    // Fetch flight verification from Amadeus
    await fetchAndAutoFillAirports(
      formData.airline,
      formData.flightNumber,
      formData.dateOfTravel
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validate all required fields
    const newErrors = {};

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!validateName(formData.lastName)) {
      newErrors.lastName = 'Only letters, spaces, hyphens, and apostrophes allowed';
    }

    if (!formData.airline) {
      newErrors.airline = 'Airline is required';
    }

    if (!formData.flightNumber?.trim()) {
      newErrors.flightNumber = 'Flight number is required';
    }

    if (!formData.dateOfTravel) {
      newErrors.dateOfTravel = 'Date of travel is required';
    } else if (!validateDateOfTravel(formData.dateOfTravel)) {
      newErrors.dateOfTravel = 'Travel date cannot be in the future';
    }

    if (!formData.originAirport?.trim()) {
      newErrors.originAirport = 'Origin airport is required';
    }

    if (!formData.destinationAirport?.trim()) {
      newErrors.destinationAirport = 'Destination airport is required';
    }

    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setIsLoading(false);
      setError('⚠️ Please fix the errors above before submitting');
      return;
    }

    try {
      // Ensure airline code is attached to flight number
      let fullFlightNum = formData.flightNumber.toUpperCase().trim();
      const airlineCode = formData.airline.toUpperCase().trim();
      if (!fullFlightNum.startsWith(airlineCode)) {
        fullFlightNum = `${airlineCode}${fullFlightNum}`;
      }

      // Call verification service
      const result = await verifyTravelDetails({
        lastName: formData.lastName.trim(),
        flightNumber: fullFlightNum,
        dateOfTravel: formData.dateOfTravel,
        originAirport: formData.originAirport.toUpperCase().trim(),
        destinationAirport: formData.destinationAirport.toUpperCase().trim(),
        baggageTag: formData.baggageTag.trim(),
        pnr: formData.pnr.toUpperCase().trim(),
        ticketNumber: formData.ticketNumber.trim(),
        passportNumber: formData.passportNumber.trim(),
      });

      if (result.status === 'travel-verified' || result.status === 'travel-likely') {
        setSuccessMessage('✅ Travel verified successfully! Proceeding to luggage details...');
        setTimeout(() => {
          onVerificationComplete(result);
        }, 1500);
      } else {
        setError('⚠️ Could not verify travel. Please check your details and try again.');
      }
    } catch (error) {
      console.error('Error verifying travel:', error);
      setError(`❌ Verification failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get max date for input (today) - users can select today or earlier dates only
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Details Section */}
      <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 shadow-2xl border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          Personal Details
        </h2>

        <div className="form-group">
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1.5">
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:bg-black/60 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200 ${validationErrors.lastName ? 'border-red-500' : 'border-white/10'
              }`}
            placeholder="Enter your last name"
            disabled={isLoading}
          />
          {validationErrors.lastName && (
            <p className="text-red-400 text-xs mt-1">{validationErrors.lastName}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Letters only (no numbers or special characters)</p>
        </div>
      </div>

      {/* Travel Confirmation Section */}
      <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 shadow-2xl border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          Travel Confirmation
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="airline" className="block text-sm font-medium text-gray-300 mb-1.5">
                Airline <span className="text-red-400">*</span>
              </label>
              <select
                id="airline"
                name="airline"
                value={formData.airline}
                onChange={handleFlightDetailsChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:bg-black/80 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200 ${validationErrors.airline ? 'border-red-500' : 'border-white/10'
                  }`}
                disabled={isLoading}
              >
                <option value="" className="bg-black text-gray-400">Select Airline</option>
                {AIRLINES.map(airline => (
                  <option key={airline.code} value={airline.code} className="bg-black text-white">
                    {airline.code} - {airline.name}
                  </option>
                ))}
              </select>
              {validationErrors.airline && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.airline}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-300 mb-1.5">
                Flight Number <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="flightNumber"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleFlightDetailsChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:bg-black/60 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200 ${validationErrors.flightNumber ? 'border-red-500' : 'border-white/10'
                  }`}
                placeholder="e.g., AA123"
                disabled={isLoading}
              />
              {validationErrors.flightNumber && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.flightNumber}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dateOfTravel" className="block text-sm font-medium text-gray-300 mb-1.5">
              Date of Travel <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              id="dateOfTravel"
              name="dateOfTravel"
              value={formData.dateOfTravel}
              onChange={handleFlightDetailsChange}
              max={today}
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white font-medium [color-scheme:dark] focus:bg-black/60 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200 ${validationErrors.dateOfTravel ? 'border-red-500' : 'border-white/10'
                }`}
              disabled={isLoading}
            />
            {validationErrors.dateOfTravel && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.dateOfTravel}</p>
            )}
          </div>

          {/* Refresh Button to Verify Flight with Amadeus */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleManualFetchClick}
              disabled={isFetchingRoute || isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 rounded-lg font-medium transition-all shadow-lg shadow-white/5"
            >
              {isFetchingRoute ? (
                <span>Verifying Flight...</span>
              ) : (
                <span>Verify Flight Details</span>
              )}
            </button>
            {isFetchingRoute && (
              <p className="text-blue-400 text-xs mt-2">Checking with Amadeus API...</p>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
              {successMessage}
            </div>
          )}

          {/* Airport Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="originAirport" className="block text-sm font-medium text-gray-300 mb-1.5">
                From Airport <span className="text-red-400">*</span>
              </label>
              <select
                id="originAirport"
                name="originAirport"
                value={formData.originAirport}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:bg-black/80 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200 ${validationErrors.originAirport ? 'border-red-500' : 'border-white/10'
                  }`}
                disabled={isLoading || isFetchingRoute}
              >
                <option value="" className="bg-black text-gray-400">Select Origin</option>
                {AIRPORTS.map(airport => (
                  <option key={`origin-${airport.code}`} value={airport.code} className="bg-black text-white">
                    {airport.code} - {airport.name}
                  </option>
                ))}
              </select>
              {validationErrors.originAirport && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.originAirport}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="destinationAirport" className="block text-sm font-medium text-gray-300 mb-1.5">
                To Airport <span className="text-red-400">*</span>
              </label>
              <select
                id="destinationAirport"
                name="destinationAirport"
                value={formData.destinationAirport}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white focus:bg-black/80 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200 ${validationErrors.destinationAirport ? 'border-red-500' : 'border-white/10'
                  }`}
                disabled={isLoading || isFetchingRoute}
              >
                <option value="" className="bg-black text-gray-400">Select Destination</option>
                {AIRPORTS.map(airport => (
                  <option key={`dest-${airport.code}`} value={airport.code} className="bg-black text-white">
                    {airport.code} - {airport.name}
                  </option>
                ))}
              </select>
              {validationErrors.destinationAirport && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.destinationAirport}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Other Information Section */}
      <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 shadow-2xl border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          Other Information
          <span className="text-sm text-gray-400 font-normal">(Optional)</span>
        </h2>

        <p className="text-gray-400 text-sm mb-6">
          Providing additional details helps us verify your travel and speed up luggage recovery.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="baggageTag" className="block text-sm font-medium text-gray-300 mb-1.5">
              Baggage Tag Number
            </label>
            <input
              type="text"
              id="baggageTag"
              name="baggageTag"
              value={formData.baggageTag}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:bg-black/60 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200"
              placeholder="Found on your baggage claim"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pnr" className="block text-sm font-medium text-gray-300 mb-1.5">
              PNR (Booking Reference)
            </label>
            <input
              type="text"
              id="pnr"
              name="pnr"
              value={formData.pnr}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:bg-black/60 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200"
              placeholder="6-character booking code"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticketNumber" className="block text-sm font-medium text-gray-300 mb-1.5">
              Ticket Number
            </label>
            <input
              type="text"
              id="ticketNumber"
              name="ticketNumber"
              value={formData.ticketNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:bg-black/60 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200"
              placeholder="13-digit ticket number"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-300 mb-1.5">
              Passport Number
            </label>
            <input
              type="text"
              id="passportNumber"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:bg-black/60 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all duration-200"
              placeholder="For identity confirmation"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="submit"
          disabled={isLoading || isFetchingRoute}
          className="order-1 sm:order-2 flex-1 px-6 py-3.5 bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 font-bold rounded-xl transition-all shadow-lg shadow-white/10"
        >
          {isLoading ? 'Verifying...' : 'Verify & Continue'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading || isFetchingRoute}
          className="order-2 sm:order-1 flex-1 px-6 py-3.5 border border-white/20 text-white hover:bg-white/10 disabled:bg-transparent disabled:text-gray-600 font-medium rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>

  );
};

export default TravelVerificationForm;
