import React, { useState } from 'react';
import { verifyTravelDetails } from '../services/TravelVerificationService';
import { fetchFlightRoute } from '../services/AviationstackService';
import '../animations.css';

/**
 * Airport data with code and name - sorted alphabetically by name
 */
const AIRPORTS = [
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport (Ahmedabad)' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol' },
  { code: 'AUH', name: 'Abu Dhabi International Airport' },
  { code: 'BLR', name: 'Kempegowda International Airport (Bangalore)' },
  { code: 'BCN', name: 'Barcelona-El Prat Airport' },
  { code: 'BOS', name: 'Boston Logan International Airport' },
  { code: 'BKK', name: 'Suvarnabhumi Airport (Bangkok)' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport (Kolkata)' },
  { code: 'CDG', name: 'Paris Charles de Gaulle Airport' },
  { code: 'CGP', name: 'Chittagong International Airport' },
  { code: 'CMB', name: 'Bandaranaike International Airport (Colombo)' },
  { code: 'COK', name: 'Cochin International Airport' },
  { code: 'DAC', name: 'Hazrat Shahjalal International Airport (Dhaka)' },
  { code: 'DEL', name: 'Indira Gandhi International Airport (Delhi)' },
  { code: 'DEN', name: 'Denver International Airport' },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport' },
  { code: 'DOH', name: 'Hamad International Airport (Doha)' },
  { code: 'DXB', name: 'Dubai International Airport' },
  { code: 'DWC', name: 'Al Maktoum International Airport (Dubai)' },
  { code: 'FRA', name: 'Frankfurt Airport' },
  { code: 'HND', name: 'Tokyo Haneda Airport' },
  { code: 'HKG', name: 'Hong Kong International Airport' },
  { code: 'HYD', name: 'Rajiv Gandhi International Airport (Hyderabad)' },
  { code: 'ISB', name: 'Benazir Bhutto International Airport (Islamabad)' },
  { code: 'IST', name: 'Istanbul Airport' },
  { code: 'JAI', name: 'Jaipur International Airport' },
  { code: 'JAT', name: 'Jaffna International Airport' },
  { code: 'JFK', name: 'John F. Kennedy International Airport (New York)' },
  { code: 'KHI', name: 'Jinnah International Airport (Karachi)' },
  { code: 'KIX', name: 'Kobe Airport' },
  { code: 'KTM', name: 'Tribhuvan International Airport (Kathmandu)' },
  { code: 'KUL', name: 'Kuala Lumpur International Airport' },
  { code: 'LAX', name: 'Los Angeles International Airport' },
  { code: 'LHE', name: 'Allama Iqbal International Airport (Lahore)' },
  { code: 'LHR', name: 'London Heathrow Airport' },
  { code: 'LGW', name: 'London Gatwick Airport' },
  { code: 'LKO', name: 'Amausi Airport (Lucknow)' },
  { code: 'MAA', name: 'Chennai International Airport' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport' },
  { code: 'MEL', name: 'Melbourne Airport' },
  { code: 'MIA', name: 'Miami International Airport' },
  { code: 'MLE', name: 'Velana International Airport (Malé)' },
  { code: 'MNL', name: 'Ninoy Aquino International Airport (Manila)' },
  { code: 'MUC', name: 'Munich Airport' },
  { code: 'MUM', name: 'Bombay High International Airport (Mumbai)' },
  { code: 'MUX', name: 'Multan International Airport' },
  { code: 'NRT', name: 'Narita International Airport (Tokyo)' },
  { code: 'ORD', name: 'Chicago O\'Hare International Airport' },
  { code: 'PBH', name: 'Paro International Airport' },
  { code: 'PEK', name: 'Beijing Capital International Airport' },
  { code: 'PEW', name: 'Peshawar International Airport' },
  { code: 'PKR', name: 'Pokhara International Airport' },
  { code: 'PNQ', name: 'Pune Airport' },
  { code: 'PRG', name: 'Václav Havel Airport Prague' },
  { code: 'PVG', name: 'Shanghai Pudong International Airport' },
  { code: 'SEA', name: 'Seattle-Tacoma International Airport' },
  { code: 'SFO', name: 'San Francisco International Airport' },
  { code: 'SIN', name: 'Singapore Changi Airport' },
  { code: 'SYD', name: 'Sydney Airport' },
  { code: 'SYL', name: 'Sylhet International Airport' },
  { code: 'VIE', name: 'Vienna International Airport' },
  { code: 'VTZ', name: 'Visakhapatnam Airport' },
  { code: 'WAW', name: 'Warsaw Chopin Airport' },
  { code: 'ZRH', name: 'Zurich Airport' },
];

/**
 * Airlines data with code and name - sorted alphabetically by name
 */
const AIRLINES = [
  { code: '6E', name: 'IndiGo' },
  { code: 'AA', name: 'American Airlines' },
  { code: 'AC', name: 'Air Canada' },
  { code: 'AF', name: 'Air France' },
  { code: 'AI', name: 'Air India' },
  { code: 'AK', name: 'AirAsia' },
  { code: 'ANA', name: 'All Nippon Airways (ANA)' },
  { code: 'B6', name: 'JetBlue Airways' },
  { code: 'BA', name: 'British Airways' },
  { code: 'BG', name: 'Biman Bangladesh Airlines' },
  { code: 'BR', name: 'EVA Air' },
  { code: 'BS', name: 'Air Astana' },
  { code: 'BX', name: 'Air Busan' },
  { code: 'CA', name: 'Air China' },
  { code: 'CI', name: 'China Airlines' },
  { code: 'CX', name: 'Cathay Pacific' },
  { code: 'DL', name: 'Delta Air Lines' },
  { code: 'EK', name: 'Emirates' },
  { code: 'EY', name: 'Etihad Airways' },
  { code: 'EZY', name: 'easyJet' },
  { code: 'F9', name: 'Frontier Airlines' },
  { code: 'FB', name: 'FitsAir' },
  { code: 'FD', name: 'Flydubai' },
  { code: 'FR', name: 'Ryanair' },
  { code: 'G4', name: 'Allegiant Air' },
  { code: 'G8', name: 'GoAir' },
  { code: 'GF', name: 'Gulf Air' },
  { code: 'HU', name: 'Hainan Airlines' },
  { code: 'IB', name: 'Iberia' },
  { code: 'JAL', name: 'Japan Airlines' },
  { code: 'JU', name: 'Air Astana' },
  { code: 'KE', name: 'Korean Air' },
  { code: 'KL', name: 'KLM Royal Dutch Airlines' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'LX', name: 'SWISS International Air Lines' },
  { code: 'MH', name: 'Malaysia Airlines' },
  { code: 'MS', name: 'EgyptAir' },
  { code: 'MU', name: 'China Eastern Airlines' },
  { code: 'NH', name: 'All Nippon Airways' },
  { code: 'NK', name: 'Spirit Airlines' },
  { code: 'NW', name: 'Serene Air' },
  { code: 'OZ', name: 'Asiana Airlines' },
  { code: 'PK', name: 'Pakistan International Airlines (PIA)' },
  { code: 'PR', name: 'Philippine Airlines' },
  { code: 'QF', name: 'Qantas' },
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'RA', name: 'Royal Nepal Airlines' },
  { code: 'SG', name: 'SpiceJet' },
  { code: 'SN', name: 'Brussels Airlines' },
  { code: 'SQ', name: 'Singapore Airlines' },
  { code: 'SV', name: 'Saudia' },
  { code: 'TG', name: 'Thai Airways International' },
  { code: 'TR', name: 'Tigerair' },
  { code: 'UA', name: 'United Airlines' },
  { code: 'UL', name: 'SriLankan Airlines' },
  { code: 'UK', name: 'Vistara' },
  { code: 'VN', name: 'Vietnam Airlines' },
  { code: 'VY', name: 'Vueling' },
  { code: 'WN', name: 'Southwest Airlines' },
  { code: 'ZE', name: 'Eastar Jet' },
];

/**
 * TravelVerificationForm Component
 * Step 1: Collect and verify travel identifiers before luggage reporting
 * 
 * Required fields: Last name, flight number, date of travel, origin, destination
 * Optional fields: Baggage tag, PNR, ticket number, passport (for identity confirmation)
 */
const TravelVerificationForm = ({ onVerificationComplete, onCancel }) => {
  const [formData, setFormData] = useState({
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
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

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
          originAirport: flightRoute.originAirport,
          destinationAirport: flightRoute.destinationAirport
        }));
        setRouteInfo(flightRoute);
        setError(null);
        setSuccessMessage(`✅ Flight route auto-filled: ${flightRoute.originAirport} → ${flightRoute.destinationAirport}`);
      } else {
        console.log('⚠️ [AUTO-FILL] No route data received');
        setRouteInfo(null);
        setError('❌ Could not find flight information. Please enter airports manually or try a different flight.');
      }
    } catch (err) {
      console.error('❌ [AUTO-FILL] Error fetching flight route:', err);
      setRouteInfo(null);
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
      // Call verification service
      const result = await verifyTravelDetails({
        lastName: formData.lastName.trim(),
        flightNumber: formData.flightNumber.toUpperCase().trim(),
        dateOfTravel: formData.dateOfTravel,
        originAirport: formData.originAirport.toUpperCase().trim(),
        destinationAirport: formData.destinationAirport.toUpperCase().trim(),
        baggageTag: formData.baggageTag.trim(),
        pnr: formData.pnr.toUpperCase().trim(),
        ticketNumber: formData.ticketNumber.trim(),
        passportNumber: formData.passportNumber.trim(),
      });

      setVerificationStatus(result.status);

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Personal Details Section */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-xl">👤</span> Personal Details
        </h2>

        <div className="form-group">
          <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              validationErrors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter your last name"
            disabled={isLoading}
          />
          {validationErrors.lastName && (
            <p className="text-red-600 text-xs mt-1">❌ {validationErrors.lastName}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">Letters only (no numbers or special characters)</p>
        </div>
      </div>

      {/* Travel Confirmation Section */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="text-xl">✈️</span> Travel Confirmation
        </h2>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-group">
              <label htmlFor="airline" className="block text-xs font-medium text-gray-700 mb-1">
                Airline <span className="text-red-500">*</span>
              </label>
              <select
                id="airline"
                name="airline"
                value={formData.airline}
                onChange={handleFlightDetailsChange}
                className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  validationErrors.airline ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value="">Select Airline</option>
                {AIRLINES.map(airline => (
                  <option key={airline.code} value={airline.code}>
                    {airline.code} - {airline.name}
                  </option>
                ))}
              </select>
              {validationErrors.airline && (
                <p className="text-red-600 text-sm mt-1">❌ {validationErrors.airline}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Flight Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="flightNumber"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleFlightDetailsChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  validationErrors.flightNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., AA123, BA456"
                disabled={isLoading}
              />
              {validationErrors.flightNumber && (
                <p className="text-red-600 text-sm mt-1">❌ {validationErrors.flightNumber}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dateOfTravel" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Travel <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="dateOfTravel"
              name="dateOfTravel"
              value={formData.dateOfTravel}
              onChange={handleFlightDetailsChange}
              max={today}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                validationErrors.dateOfTravel ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {validationErrors.dateOfTravel && (
              <p className="text-red-600 text-sm mt-1">❌ {validationErrors.dateOfTravel}</p>
            )}
          </div>

          {/* Refresh Button to Verify Flight with Amadeus */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleManualFetchClick}
              disabled={isFetchingRoute || isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {isFetchingRoute ? (
                <>
                  <span className="inline-block animate-spin">🔄</span>
                  <span>Verifying Flight...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Verify Flight Details</span>
                </>
              )}
            </button>
            {isFetchingRoute && (
              <p className="text-blue-600 text-sm mt-2">Checking with Amadeus API...</p>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {/* Airport Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="originAirport" className="block text-sm font-medium text-gray-700 mb-2">
                From Airport <span className="text-red-500">*</span>
              </label>
              <select
                id="originAirport"
                name="originAirport"
                value={formData.originAirport}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  validationErrors.originAirport ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading || isFetchingRoute}
              >
                <option value="">Select Origin Airport</option>
                {AIRPORTS.map(airport => (
                  <option key={`origin-${airport.code}`} value={airport.code}>
                    {airport.code} - {airport.name}
                  </option>
                ))}
              </select>
              {validationErrors.originAirport && (
                <p className="text-red-600 text-sm mt-1">❌ {validationErrors.originAirport}</p>
              )}
              {routeInfo?.originAirport && (
                <p className="text-green-600 text-xs mt-1">✅ Auto-filled: {routeInfo.originAirport}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="destinationAirport" className="block text-sm font-medium text-gray-700 mb-2">
                To Airport <span className="text-red-500">*</span>
              </label>
              <select
                id="destinationAirport"
                name="destinationAirport"
                value={formData.destinationAirport}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  validationErrors.destinationAirport ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isLoading || isFetchingRoute}
              >
                <option value="">Select Destination Airport</option>
                {AIRPORTS.map(airport => (
                  <option key={`dest-${airport.code}`} value={airport.code}>
                    {airport.code} - {airport.name}
                  </option>
                ))}
              </select>
              {validationErrors.destinationAirport && (
                <p className="text-red-600 text-sm mt-1">❌ {validationErrors.destinationAirport}</p>
              )}
              {routeInfo?.destinationAirport && (
                <p className="text-green-600 text-xs mt-1">✅ Auto-filled: {routeInfo.destinationAirport}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Other Information Section */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">ℹ️</span> Other Information
          <span className="text-sm text-gray-500 font-normal">(Optional)</span>
        </h2>

        <p className="text-gray-600 text-sm mb-4">
          Providing additional details helps us verify your travel and speed up luggage recovery.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="baggageTag" className="block text-sm font-medium text-gray-700 mb-2">
              Baggage Tag Number
            </label>
            <input
              type="text"
              id="baggageTag"
              name="baggageTag"
              value={formData.baggageTag}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Found on your baggage claim"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pnr" className="block text-sm font-medium text-gray-700 mb-2">
              PNR (Booking Reference)
            </label>
            <input
              type="text"
              id="pnr"
              name="pnr"
              value={formData.pnr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6-character booking code"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticketNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Number
            </label>
            <input
              type="text"
              id="ticketNumber"
              name="ticketNumber"
              value={formData.ticketNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="13-digit ticket number"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Passport Number
            </label>
            <input
              type="text"
              id="passportNumber"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="For identity confirmation"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isLoading || isFetchingRoute}
          className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {isLoading ? '⏳ Verifying...' : '✅ Verify & Continue'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading || isFetchingRoute}
          className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-semibold rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TravelVerificationForm;
