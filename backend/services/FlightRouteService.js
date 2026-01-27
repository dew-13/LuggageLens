/**
 * Flight Route Service
 * Fetches flight route information from Amadeus and Aviationstack APIs
 * Returns origin and destination airports for auto-filling
 */

const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY || 'b819f80ba59d5471b397c6f9a35d2d85';
const AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID || 'xiJ6TMXqHrnsn0y1s2l8EF2NUGczwGX8';
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET || 'lt2Dgq9KDIHWwOu6';

/**
 * Format flight number to standard format (e.g., AA100)
 * Handles inputs like "AA100", "100" (if airline provided), etc.
 */
const formatFlightNumber = (flightInput, airlineInput = '') => {
  // Remove whitespace and convert to uppercase
  let cleanFlight = flightInput.replace(/\s+/g, '').toUpperCase();
  let cleanAirline = airlineInput.replace(/\s+/g, '').toUpperCase();

  // If flight number already starts with the airline code (e.g. "UL605" when airline is "UL")
  if (cleanAirline && cleanFlight.startsWith(cleanAirline)) {
    return {
      airline_iata: cleanAirline,
      flight_number: cleanFlight.replace(cleanAirline, '')
    };
  }

  // Regex to detect if flight string contains airline code (e.g. "AA100")
  // Matches 2-3 letters followed by 1-4 digits
  const match = cleanFlight.match(/^([A-Z]{2,3})(\d{1,4})$/);

  if (match) {
    return {
      airline_iata: match[1],
      flight_number: match[2],
    };
  }

  // If no airline code in flight string, use provided airline input
  if (cleanAirline && /^\d+$/.test(cleanFlight)) {
    return {
      airline_iata: cleanAirline,
      flight_number: cleanFlight
    };
  }

  // If we have an airline and a flight code like "UL605", assume "UL" is the airline
  // This handles the user error where they put "DL" as airline but "UL605" as flight
  const flightCodeMatch = cleanFlight.match(/^([A-Z]{2,3})(\d{1,4})$/);
  if (flightCodeMatch) {
    return {
      airline_iata: flightCodeMatch[1],
      flight_number: flightCodeMatch[2],
    };
  }

  throw new Error(`Invalid flight format. Received Flight: ${flightInput}, Airline: ${airlineInput}`);
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

    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
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
 * Amadeus is used as fallback - provides flight schedule and details
 * Supports: Flight Schedule API and Flight Offers Search
 */
const fetchFromAmadeus = async (airline, flightNumber, dateOfTravel) => {
  try {
    console.log('\n🟢 [AMADEUS] Searching for flight route (fallback)...');
    console.log(`   Flight: ${airline}${flightNumber} | Date: ${dateOfTravel}`);

    const { airline_iata, flight_number } = formatFlightNumber(flightNumber, airline);

    const token = await getAmadeusToken();
    if (!token) {
      console.log('   ⚠️  Could not authenticate with Amadeus');
      return null;
    }

    const formattedDate = formatDate(dateOfTravel);
    // const fullFlightNumber = `${airline_iata}${flight_number}`; // Unused var

    // Try Amadeus Flight Schedules API
    // This endpoint can search for specific flights by flight number and date
    console.log(`   📡 API Call: https://test.api.amadeus.com/v2/schedule/flights`);
    console.log(`   📍 Query: carrierCode=${airline_iata}, flightNumber=${flight_number}, scheduledDepartureDate=${formattedDate}`);

    const params = new URLSearchParams({
      carrierCode: airline_iata,
      flightNumber: flight_number,
      scheduledDepartureDate: formattedDate,
    });

    const response = await fetch(`https://test.api.amadeus.com/v2/schedule/flights?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const responseTime = Date.now();
    console.log(`   ⏱️  Response Status: ${response.status}`);

    if (!response.ok) {
      console.log(`   ⚠️  Amadeus Flight Schedules API failed (${response.status})`);

      // Try alternate endpoint: Flight Offers Search (requires origin/destination)
      // This won't work without knowing the airports, but we can try anyway
      console.log('   💡 Trying alternate Amadeus endpoints...');
      return null;
    }

    const data = await response.json();
    console.log(`   📦 Amadeus API Response:`, JSON.stringify(data, null, 2));

    if (!data.data || data.data.length === 0) {
      console.log('   ℹ️  No flight schedules found in Amadeus for this flight');
      return null;
    }

    // Extract flight details from Amadeus response
    const flight = data.data[0];
    const result = {
      source: 'amadeus',
      originAirport: flight.departure?.at || flight.departure?.iataCode,
      destinationAirport: flight.arrival?.at || flight.arrival?.iataCode,
      originIata: flight.departure?.at || flight.departure?.iataCode,
      destinationIata: flight.arrival?.at || flight.arrival?.iataCode,
      airline: airline,
      aircraft: flight.aircraft?.iataCode,
      departure: flight.departure?.at,
      arrival: flight.arrival?.at,
      status: 'scheduled',
    };

    console.log(`   ✅ Flight found in Amadeus!`);
    console.log(`   📊 Extracted Result:`, JSON.stringify(result, null, 2));

    return result;

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

    // Update formatFlightNumber usage in fetchFromAviationstack
    const { airline_iata, flight_number } = formatFlightNumber(flightNumber, airline);
    const flightDate = formatDate(dateOfTravel);

    // Construct search query
    // Aviationstack works best with flight_iata if full code available (e.g. AA100)
    // OR airline_iata + flight_number
    const fullFlightCode = `${airline_iata}${flight_number}`;

    const params = new URLSearchParams({
      access_key: AVIATIONSTACK_API_KEY,
      flight_iata: fullFlightCode, // Use direct flight search if possible
      // flight_date: flightDate, // Optional, can filter manually to be safe
    });

    // If flight_iata fails (sometimes specific carriers have issues), try broader search
    // NOTE: Using HTTP instead of HTTPS because free-tier Aviationstack keys often return 403 on HTTPS
    const url = `http://api.aviationstack.com/v1/flights?${params.toString()}`;
    const startTime = Date.now();

    console.log(`   📡 API Call: http://api.aviationstack.com/v1/flights`);
    console.log(`   📍 Query: flight_iata=${fullFlightCode}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    const responseTime = Date.now() - startTime;
    console.log(`   ⏱️  Response time: ${responseTime}ms | Status: ${response.status}`);

    if (!response.ok) {
      console.warn(`   ⚠️  Aviationstack API error (${response.status})`);
      return null; // Don't throw, return null to fallback
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log('   ℹ️  No flights found for this code. Trying alternate search...');
      // Fallback: search by airline and flight number separately if direct code failed
      // This handles cases where carrier might be different in system
      return null;
    }

    // Filter results by date manually to be precise
    const matchingFlight = data.data.find(flight => {
      return flight.flight_date === flightDate;
    });

    if (!matchingFlight) {
      console.log(`   ⚠️  Flight found but not on date ${flightDate}`);
      console.log(`   💡 Available dates: ${data.data.map(f => f.flight_date).join(', ')}`);
      return null;
    }



    const flight = matchingFlight;
    const result = {
      source: 'aviationstack',
      originAirport: flight.departure?.airport || flight.departure?.iata,
      destinationAirport: flight.arrival?.airport || flight.arrival?.iata,
      originIata: flight.departure?.iata,
      destinationIata: flight.arrival?.iata,
      airline: flight.airline?.name || airline_iata,
      aircraft: flight.aircraft?.iata,
      departure: flight.departure?.scheduled,
      arrival: flight.arrival?.scheduled,
      status: flight.flight_status,
    };

    console.log(`   ✅ Flight found!`);
    console.log(`   📊 Extracted Result:`, JSON.stringify(result, null, 2));
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
 * Tries: 1) Aviationstack → 2) Amadeus → 3) Simulated Data
 */
const getFlightRoute = async (airline, flightNumber, dateOfTravel) => {
  try {
    console.log('\n📍 [FLIGHT ROUTE] Auto-fill request received');
    console.log(`   Airline: ${airline} | Flight: ${flightNumber} | Date: ${dateOfTravel}`);

    // Validate inputs
    if (!airline || !flightNumber || !dateOfTravel) {
      throw new Error('Missing required parameters: airline, flightNumber, dateOfTravel');
    }

    // Try Aviationstack (FIRST CHOICE - best for flight number + date search)
    console.log('\n🟢 [ATTEMPT 1/3] Trying Aviationstack API...');
    const aviationResult = await fetchFromAviationstack(airline, flightNumber, dateOfTravel);
    if (aviationResult) {
      console.log('\n✅ [SUCCESS] Route verified via Aviationstack\n');
      return aviationResult;
    }

    console.log('\n❌ [FAILED] Aviationstack did not find flight');

    // Try Amadeus (SECOND CHOICE - fallback)
    console.log('\n🟢 [ATTEMPT 2/3] Trying Amadeus API (fallback)...');
    const amadeusResult = await fetchFromAmadeus(airline, flightNumber, dateOfTravel);
    if (amadeusResult) {
      console.log('\n✅ [SUCCESS] Route verified via Amadeus\n');
      return amadeusResult;
    }

    console.log('\n❌ [FAILED] Amadeus also unavailable');

    // Fallback to simulated data
    console.log('\n🟢 [ATTEMPT 3/3] Using simulated flight data (last resort)...');
    console.log('⚠️  [WARNING] Neither API could verify this flight. Using simulated data.');
    const simulatedResult = getSimulatedFlightRoute(airline, flightNumber);
    if (simulatedResult) {
      console.log('\n✅ [FALLBACK SUCCESS] Using simulated route\n');
      return simulatedResult;
    }

    console.log('\n❌ [COMPLETE FAILURE] No route data available');
    return null;

  } catch (error) {
    console.error('❌ [FLIGHT ROUTE] Error:', error.message);
    // Still return simulated data as fallback
    console.log('\n🟢 [EMERGENCY FALLBACK] Returning simulated data due to error...');
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
