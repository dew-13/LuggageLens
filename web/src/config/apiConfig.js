/**
 * API Configuration
 * Flight Verification APIs
 * 
 * IMPORTANT: These keys should be stored in environment variables
 * For development only - move to backend for production
 */

export const API_CONFIG = {
  // Aviationstack API for real-time flight tracking
  aviationstack: {
    apiKey: process.env.REACT_APP_AVIATIONSTACK_KEY,
    baseUrl: 'https://api.aviationstack.com/v1',
    endpoints: {
      flights: '/flights',
    },
  },

  // Amadeus API for flight search and schedules
  amadeus: {
    apiKey: process.env.REACT_APP_AMADEUS_KEY,
    baseUrl: 'https://test.api.amadeus.com',
    endpoints: {
      auth: '/v1/security/oauth2/token',
      flightOffers: '/v2/shopping/flight-offers',
      flightInspiration: '/v1/shopping/flight-inspiration',
    },
  },

  // Backend proxy endpoints (recommended for production)
  backend: {
    baseUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api',
    endpoints: {
      verifyTravel: '/verify-travel',
      searchFlights: '/search-flights',
      validateFlight: '/validate-flight',
    },
  },
};

/**
 * Note: API keys should NEVER be hardcoded in frontend code for production.
 * Instead, use environment variables and backend proxy:
 * 
 * Development (.env.local):
 * REACT_APP_AVIATIONSTACK_KEY=your_aviationstack_key_here
 * REACT_APP_AMADEUS_KEY=your_amadeus_key_here
 * REACT_APP_BACKEND_URL=http://localhost:5000/api
 * 
 * Production (.env):
 * Backend should handle all API calls securely
 * Frontend makes requests to /api/verify-travel instead
 */

export default API_CONFIG;
