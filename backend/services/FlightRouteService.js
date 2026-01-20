/**
 * Flight Route Service
 * Fetches flight route information from Amadeus and Aviationstack APIs
 * Returns origin and destination airports for auto-filling
 */

const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY || 'b819f80ba59d5471b397c6f9a35d2d85';
const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID || 'xiJ6TMXqHrnsn0y1s2l8EF2NUGczwGX8';
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET || 'YOUR_SECRET_KEY';

/**
 * Format flight number to standard format (e.g., AA100)
 */
const formatFlightNumber = (flightNumber) => {
  const match = flightNumber.match(/^([A-Z]{2})(\d+)$/);
  if (match) {
    return {
      airline_iata: match[1],
      flight_number: match[2],
    };
  }
  throw new Error('Invalid flight number format. Use format like: AA100, BA456');
};

/**
 * Convert ISO date to format needed by APIs (YYYY-MM-DD)
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Get Amadeus OAuth2 Token
 */
const getAmadeusToken = async () => {
  try {
    console.log('🔐 [AMADEUS] Requesting OAuth2 token...');
    
    const response = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_CLIENT_ID,
        client_secret: AMADEUS_CLIENT_SECRET,
      }).toString(),
    });

    if (!response.ok) {
      console.warn(`   ⚠️  Token request failed (${response.status})`);
      return null;
    }

    const data = await response.json();
    console.log('   ✅ Token acquired successfully');
    return data.access_token;
  } catch (error) {
    console.error('   ❌ Error getting Amadeus token:', error.message);
    return null;
  }
};

/**
 * Fetch flight route from Amadeus API
 * Amadeus is better for scheduled flight information
 */
const fetchFromAmadeus = async (airline, flightNumber, dateOfTravel) => {
  try {
    console.log('\n🟢 [AMADEUS] Searching for flight route...');
    console.log(`   Flight: ${airline}${flightNumber} | Date: ${dateOfTravel}`);

    const token = await getAmadeusToken();
    if (!token) {
      console.log('   ⚠️  Could not authenticate with Amadeus');
      return null;
    }

    // Amadeus flight search requires departure city/airport and arrival city/airport
    // We'll search for flights on the given date
    const formattedDate = formatDate(dateOfTravel);

    // Since we don't know origin/dest yet, we'll search broadly
    // This is a limitation - Amadeus requires knowing at least the origin/destination
    // So we'll try the POST search endpoint with the flight number filter
    const response = await fetch('https://api.amadeus.com/v2/shopping/flight-offers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`   ⚠️  Amadeus search failed (${response.status})`);
      return null;
    }

    console.log('   ✅ Amadeus search completed');
    return null; // Amadeus requires specific departure/arrival, can't search by flight number alone
  } catch (error) {
    console.error('   ❌ Amadeus error:', error.message);
    return null;
  }
};

/**
 * Fetch flight route from Aviationstack API
 * Aviationstack is better for real-time flight details by flight number and date
 */
const fetchFromAviationstack = async (airline, flightNumber, dateOfTravel) => {
  try {
    console.log('\n🔵 [AVIATIONSTACK] Searching for flight route...');
    console.log(`   Flight: ${airline}${flightNumber} | Date: ${dateOfTravel}`);

    const { airline_iata, flight_number } = formatFlightNumber(`${airline}${flightNumber}`);
    const flightDate = formatDate(dateOfTravel);
    const fullFlightNumber = `${airline_iata}${flight_number}`;

    const params = new URLSearchParams({
      access_key: AVIATIONSTACK_API_KEY,
      flight_iata: fullFlightNumber,
      flight_date: flightDate,
      limit: 20,
    });

    const url = `https://api.aviationstack.com/v1/flights?${params.toString()}`;
    const startTime = Date.now();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseTime = Date.now() - startTime;
    console.log(`   ⏱️  Response time: ${responseTime}ms | Status: ${response.status}`);

    if (!response.ok) {
      console.log(`   ⚠️  Aviationstack API error (${response.status})`);
      return null;
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log('   ℹ️  No flights found in Aviationstack');
      return null;
    }

    // Get the first matching flight
    const flight = data.data[0];
    const result = {
      source: 'aviationstack',
      originAirport: flight.departure?.airport,
      destinationAirport: flight.arrival?.airport,
      airline: flight.airline?.name || airline_iata,
      aircraft: flight.aircraft?.iata,
      departure: flight.departure?.scheduled,
      arrival: flight.arrival?.scheduled,
      status: flight.flight_status,
    };

    console.log(`   ✅ Flight found!`);
    console.log(`   📍 Route: ${result.originAirport} → ${result.destinationAirport}`);
    console.log(`   ✈️  Aircraft: ${result.aircraft} | Status: ${result.status}`);

    return result;
  } catch (error) {
    console.error('   ❌ Aviationstack error:', error.message);
    return null;
  }
};

/**
 * Main function to fetch flight route
 * Tries Aviationstack first, then falls back to simulated data
 */
const getFlightRoute = async (airline, flightNumber, dateOfTravel) => {
  try {
    console.log('\n📍 [FLIGHT ROUTE] Auto-fill request received');
    console.log(`   Airline: ${airline} | Flight: ${flightNumber} | Date: ${dateOfTravel}`);

    // Validate inputs
    if (!airline || !flightNumber || !dateOfTravel) {
      throw new Error('Missing required parameters: airline, flightNumber, dateOfTravel');
    }

    // Try Aviationstack (best for flight number + date search)
    const aviationResult = await fetchFromAviationstack(airline, flightNumber, dateOfTravel);
    if (aviationResult) {
      return aviationResult;
    }

    // Try Amadeus (if Aviationstack failed)
    console.log('\n🔄 [FALLBACK] Aviationstack unavailable, trying Amadeus...');
    const amadeusResult = await fetchFromAmadeus(airline, flightNumber, dateOfTravel);
    if (amadeusResult) {
      return amadeusResult;
    }

    // Fallback to simulated data
    console.log('\n⚠️  [FALLBACK] Using simulated flight data');
    return getSimulatedFlightRoute(airline, flightNumber);

  } catch (error) {
    console.error('❌ [FLIGHT ROUTE] Error:', error.message);
    // Still return simulated data as fallback
    return getSimulatedFlightRoute(airline, flightNumber);
  }
};

/**
 * Simulated flight data for common flights
 * Used as ultimate fallback
 */
const getSimulatedFlightRoute = (airline, flightNumber) => {
  console.log(`   Using simulated data for ${airline}${flightNumber}`);

  const simulatedRoutes = {
    'AA100': { origin: 'JFK', destination: 'LAX' },
    'AA456': { origin: 'LAX', destination: 'ORD' },
    'AA789': { origin: 'SFO', destination: 'JFK' },
    'BA456': { origin: 'LHR', destination: 'JFK' },
    'BA205': { origin: 'LHR', destination: 'CDG' },
    'DL123': { origin: 'ATL', destination: 'LAX' },
    'UL605': { origin: 'MEL', destination: 'CMB' },
    'UL606': { origin: 'CMB', destination: 'MEL' },
    '6E100': { origin: 'DEL', destination: 'BOM' },
    '6E456': { origin: 'BLR', destination: 'DEL' },
    'AI202': { origin: 'DEL', destination: 'MUM' },
    'BA007': { origin: 'LHR', destination: 'LGW' },
  };

  const key = `${airline}${flightNumber}`;
  const route = simulatedRoutes[key];

  if (route) {
    return {
      source: 'simulated',
      originAirport: route.origin,
      destinationAirport: route.destination,
      airline: airline,
      aircraft: 'Unknown',
      departure: 'N/A',
      arrival: 'N/A',
      status: 'Simulated Data',
    };
  }

  return null;
};

module.exports = {
  getFlightRoute,
  formatFlightNumber,
  formatDate,
};
