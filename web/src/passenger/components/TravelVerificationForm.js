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

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleFlightDetailsChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data immediately with new value
    const updatedData = {
      ...formData,
      [name]: value
    };
    
    setFormData(updatedData);
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
    if (!formData.airline || !formData.airline.trim()) {
      setError('❌ Please select an airline');
      return;
    }
    if (!formData.flightNumber || !formData.flightNumber.trim()) {
      setError('❌ Please enter a flight number');
      return;
    }
    if (!formData.dateOfTravel) {
      setError('❌ Please select a date of travel');
      return;
    }

    // Fetch airports
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

    try {
      // Validate required fields
      if (!formData.lastName.trim()) {
        throw new Error('Last name is required');
      }
      if (!formData.airline) {
        throw new Error('Airline is required');
      }
      if (!formData.flightNumber.trim()) {
        throw new Error('Flight number is required');
      }
      if (!formData.dateOfTravel) {
        throw new Error('Date of travel is required');
      }
      if (!formData.originAirport.trim()) {
        throw new Error('Origin airport is required');
      }
      if (!formData.destinationAirport.trim()) {
        throw new Error('Destination airport is required');
      }

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

      if (result.status === 'travel-verified') {
        setSuccessMessage('✓ Travel verified successfully! You can now report your lost luggage.');
        setTimeout(() => {
          onVerificationComplete(result);
        }, 1500);
      } else if (result.status === 'travel-likely') {
        setSuccessMessage('Travel details appear valid. Please proceed to report your luggage.');
        setTimeout(() => {
          onVerificationComplete(result);
        }, 1500);
      } else if (result.status === 'manual-review-required') {
        setSuccessMessage(
          'Your travel details will be manually reviewed. You can proceed, but your claim may require additional verification.'
        );
        // Allow proceeding after delay
        setTimeout(() => {
          onVerificationComplete(result);
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="travel-verification-form">
      <div className="verification-header">
        <h2>Step 1: Verify Your Travel Details</h2>
        <p>
          Please provide your travel information. This helps us verify your claim and expedite the recovery process.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="verification-form-content">
        <div className="form-section">
          <h3>Required Information</h3>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="form-input-animated"
              placeholder="Your full name"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="airline" className="form-label">
              Airline *
            </label>
            <select
              id="airline"
              name="airline"
              value={formData.airline}
              onChange={handleFlightDetailsChange}
              className="form-input-animated"
              disabled={isLoading}
            >
              <option value="">Airline you travelled with</option>
              {AIRLINES.map(airline => (
                <option key={airline.code} value={airline.code}>
                  {airline.code} - {airline.name}
                </option>
              ))}
            </select>
            
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="flightNumber" className="form-label">
                Flight Number *
              </label>
              <input
                type="text"
                id="flightNumber"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleFlightDetailsChange}
                className="form-input-animated"
                placeholder="e.g., AA123, BA456"
                disabled={isLoading}
              />
             
            </div>

            <div className="form-group">
              <label htmlFor="dateOfTravel" className="form-label">
                Date of Travel *
              </label>
              <input
                type="date"
                id="dateOfTravel"
                name="dateOfTravel"
                value={formData.dateOfTravel}
                onChange={handleFlightDetailsChange}
                className="form-input-animated"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Fetch Flight Route Button */}
          <div className="form-group" style={{ marginTop: '16px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={handleManualFetchClick}
              disabled={isFetchingRoute || isLoading}
              className="btn-animated"
              style={{
                backgroundColor: isFetchingRoute ? '#999' : '#2596be',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: isFetchingRoute ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
              }}
            >
              {isFetchingRoute ? (
                <>
                  <span>🔄 Fetching...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Auto-Fill Airports from Flight Details</span>
                </>
              )}
            </button>
            {isFetchingRoute && (
              <small style={{ color: '#2596be', marginTop: '8px', display: 'block' }}>
                Searching Aviationstack and Amadeus APIs...
              </small>
            )}
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="form-group" style={{
              backgroundColor: '#fee',
              border: '2px solid #f44',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '20px',
              color: '#c33'
            }}>
              <p style={{ margin: '0', fontWeight: 'bold' }}>{error}</p>
            </div>
          )}

          {/* Success Message Display */}
          {successMessage && (
            <div className="form-group" style={{
              backgroundColor: '#efe',
              border: '2px solid #4f4',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '20px',
              color: '#3a3'
            }}>
              <p style={{ margin: '0', fontWeight: 'bold' }}>{successMessage}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="originAirport" className="form-label">
              Origin Airport * {isFetchingRoute && '🔄 Loading...'}
            </label>
            <select
              id="originAirport"
              name="originAirport"
              value={formData.originAirport}
              onChange={handleChange}
              className="form-input-animated"
              disabled={isLoading || isFetchingRoute}
            >
              <option value="">{isFetchingRoute ? 'Fetching...' : 'Select Origin Airport'}</option>
              {AIRPORTS.map(airport => (
                <option key={`origin-${airport.code}`} value={airport.code}>
                  {airport.code} - {airport.name}
                </option>
              ))}
            </select>
            {routeInfo && routeInfo.originAirport && (
              <small style={{ color: '#2596be', marginTop: '4px', display: 'block', fontWeight: 'bold' }}>
                ✅ Auto-filled: {routeInfo.originAirport} | {routeInfo.source}
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="destinationAirport" className="form-label">
              Destination Airport * {isFetchingRoute && '🔄 Loading...'}
            </label>
            <select
              id="destinationAirport"
              name="destinationAirport"
              value={formData.destinationAirport}
              onChange={handleChange}
              className="form-input-animated"
              disabled={isLoading || isFetchingRoute}
            >
              <option value="">{isFetchingRoute ? 'Fetching...' : 'Select Destination Airport'}</option>
              {AIRPORTS.map(airport => (
                <option key={`dest-${airport.code}`} value={airport.code}>
                  {airport.code} - {airport.name}
                </option>
              ))}
            </select>
            {routeInfo && routeInfo.destinationAirport && (
              <small style={{ color: '#2596be', marginTop: '4px', display: 'block', fontWeight: 'bold' }}>
                ✅ Auto-filled: {routeInfo.destinationAirport} | {routeInfo.source}
              </small>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Optional Information (Helpful for Verification)</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="baggageTag" className="form-label">
                Baggage Tag Number
              </label>
              <input
                type="text"
                id="baggageTag"
                name="baggageTag"
                value={formData.baggageTag}
                onChange={handleChange}
                className="form-input-animated"
                placeholder="Found on your baggage claim"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pnr" className="form-label">
                PNR (Booking Reference)
              </label>
              <input
                type="text"
                id="pnr"
                name="pnr"
                value={formData.pnr}
                onChange={handleChange}
                className="form-input-animated"
                placeholder="6-character booking code"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ticketNumber" className="form-label">
                Ticket Number
              </label>
              <input
                type="text"
                id="ticketNumber"
                name="ticketNumber"
                value={formData.ticketNumber}
                onChange={handleChange}
                className="form-input-animated"
                placeholder="13-digit ticket number"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="passportNumber" className="form-label">
                Passport Number
              </label>
              <input
                type="text"
                id="passportNumber"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                className="form-input-animated"
                placeholder="For identity confirmation"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <span className="success-icon">✓</span>
            {successMessage}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-animated btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" style={{ 
                  display: 'inline-block', 
                  width: '14px', 
                  height: '14px', 
                  border: '2px solid #fff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  marginRight: '8px'
                }} />
                Verifying...
              </>
            ) : (
              'Verify Travel Details'
            )}
          </button>
        </div>
      </form>

      <style>{`
        .travel-verification-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 24px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .verification-header {
          margin-bottom: 24px;
          text-align: center;
        }

        .verification-header h2 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 24px;
        }

        .verification-header p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .verification-form-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-section {
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 16px;
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .form-section h3 {
          margin: 0 0 16px 0;
          color: #374151;
          font-size: 16px;
          font-weight: 600;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 12px; 
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .form-input-animated {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-input-animated:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .form-group small {
          font-size: 12px;
          color: #9ca3af;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .error-message {
          padding: 12px;
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          color: #dc2626;
          font-size: 14px;
        }

        .success-message {
          padding: 12px;
          background-color: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 6px;
          color: #16a34a;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .success-icon {
          font-weight: bold;
          font-size: 16px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 16px;
        }

        .btn-primary {
          padding: 10px 24px;
          background-color: #2596be;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #1d7a9a;
        }

        .btn-cancel {
          padding: 10px 24px;
          background-color: #e5e7eb;
          color: #374151;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-cancel:hover:not(:disabled) {
          background-color: #d1d5db;
        }

        .btn-cancel:disabled,
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .travel-verification-form {
            padding: 16px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TravelVerificationForm;
