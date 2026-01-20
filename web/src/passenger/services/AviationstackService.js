/**
 * Aviationstack API Service
 * Verifies flight details against real-time flight data
 * API: https://aviationstack.com/
 * Key: b819f80ba59d5471b397c6f9a35d2d85
 */

const AVIATIONSTACK_API_KEY = 'b819f80ba59d5471b397c6f9a35d2d85';
const AVIATIONSTACK_BASE_URL = 'https://api.aviationstack.com/v1';

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
 * Convert ISO date to Aviationstack format (YYYY-MM-DD)
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

/**
 * Validate flight with Aviationstack API
 * Returns: {found: boolean, matches: boolean, flightDetails: object}
 */
export const validateFlightWithAviationstack = async (
  flightNumber,
  dateOfTravel,
  originAirport,
  destinationAirport
) => {
  try {
    console.log('\n🔵 [AVIATIONSTACK] Starting flight verification...');
    console.log(`   Flight: ${flightNumber} | Date: ${dateOfTravel} | Route: ${originAirport} → ${destinationAirport}`);
    
    const { airline_iata, flight_number } = formatFlightNumber(flightNumber);
    const flightDate = formatDate(dateOfTravel);

    // Query parameters for Aviationstack
    const params = new URLSearchParams({
      access_key: AVIATIONSTACK_API_KEY,
      flight_iata: `${airline_iata}${flight_number}`,
      flight_date: flightDate,
      limit: 10,
    });

    const url = `${AVIATIONSTACK_BASE_URL}/flights?${params.toString()}`;

    console.log(`   📡 API Endpoint: ${AVIATIONSTACK_BASE_URL}/flights`);
    console.log(`   📍 Query: Flight=${airline_iata}${flight_number}, Date=${flightDate}`);

    // Make actual API call to Aviationstack
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    const responseTime = Date.now() - startTime;

    console.log(`   ⏱️  Response Time: ${responseTime}ms`);
    console.log(`   📊 Status Code: ${response.status} ${response.ok ? '✅' : '❌'}`);

    if (!response.ok) {
      throw new Error(`Aviationstack API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`   📦 Total Flights in Response: ${data.data?.length || 0}`);

    // Check if API returned data
    if (!data.data || data.data.length === 0) {
      console.log('   ❌ No flights found in Aviationstack database');
      return {
        found: false,
        matches: false,
        message: 'Flight not found in real-time database',
      };
    }

    // Filter flights matching the origin and destination
    const matchingFlights = data.data.filter(flight => {
      const departure = flight.departure?.airport;
      const arrival = flight.arrival?.airport;
      return (
        departure && 
        arrival && 
        (departure === originAirport || departure?.toUpperCase() === originAirport?.toUpperCase()) &&
        (arrival === destinationAirport || arrival?.toUpperCase() === destinationAirport?.toUpperCase())
      );
    });

    if (matchingFlights.length > 0) {
      const matchedFlight = matchingFlights[0];
      console.log(`   ✅ MATCH FOUND! (${matchingFlights.length} matching flight(s))`);
      console.log(`   ✈️  Aircraft: ${matchedFlight.aircraft?.iata || 'N/A'} | Status: ${matchedFlight.flight_status}`);
      console.log(`   📅 Departure: ${matchedFlight.departure?.scheduled || 'N/A'}`);
      console.log(`   📅 Arrival: ${matchedFlight.arrival?.scheduled || 'N/A'}`);
      console.log('   ✅ [AVIATIONSTACK] Verification SUCCESSFUL\n');
      return {
        found: true,
        matches: true,
        flightDetails: {
          flightNumber: matchedFlight.flight_iata || `${airline_iata}${flight_number}`,
          airline: matchedFlight.airline?.name || airline_iata,
          origin: matchedFlight.departure?.airport,
          originCity: matchedFlight.departure?.timezone,
          destination: matchedFlight.arrival?.airport,
          destinationCity: matchedFlight.arrival?.timezone,
          departure: matchedFlight.departure?.scheduled,
          arrival: matchedFlight.arrival?.scheduled,
          aircraft: matchedFlight.aircraft?.iata,
          status: matchedFlight.flight_status,
          source: 'aviationstack',
        },
        message: 'Flight verified successfully',
      };
    }

    // Partial match - flight exists but different route
    if (data.data.length > 0) {
      console.log(`   ⚠️  PARTIAL MATCH - Flight exists but route doesn't match`);
      console.log(`   📍 Found: ${data.data[0].departure?.airport} → ${data.data[0].arrival?.airport}`);
      console.log(`   📍 Expected: ${originAirport} → ${destinationAirport}`);
      console.log('   ⚠️  [AVIATIONSTACK] Partial verification\n');
      return {
        found: true,
        partial: true,
        matches: false,
        message: 'Flight exists but route does not match provided airports',
        flightDetails: {
          flightNumber: data.data[0].flight_iata,
          airline: data.data[0].airline?.name,
          source: 'aviationstack',
        },
      };
    }

    return {
      found: false,
      matches: false,
      message: 'Flight not found',
    };

  } catch (error) {
    console.error('❌ [AVIATIONSTACK] Validation error:', error.message);
    console.log('   Error Details:', error);
    throw error;
  }
};

/**
 * Simulated Aviationstack response for development
 * In production, replace with actual API call through backend
 */
const simulateAviationstackResponse = (
  airline_iata,
  flight_number,
  originAirport,
  destinationAirport,
  flightDate
) => {
  // Simulated flight database
  const knownFlights = {
    'AA100': { airline: 'American Airlines', aircraft: 'Boeing 777' },
    'BA456': { airline: 'British Airways', aircraft: 'Airbus A380' },
    'DL789': { airline: 'Delta Airlines', aircraft: 'Boeing 787' },
    'UA321': { airline: 'United Airlines', aircraft: 'Boeing 767' },
    'AF555': { airline: 'Air France', aircraft: 'Airbus A350' },
  };

  const knownAirports = ['JFK', 'LHR', 'LAX', 'CDG', 'ORD', 'DFW', 'HND', 'SFO'];

  const flightKey = `${airline_iata}${flight_number}`;
  const flightKnown = knownFlights[flightKey];
  const originValid = knownAirports.includes(originAirport);
  const destValid = knownAirports.includes(destinationAirport);

  if (flightKnown && originValid && destValid && originAirport !== destinationAirport) {
    return {
      found: true,
      matches: true,
      partial: false,
      flightNumber: flightKey,
      airline: flightKnown.airline,
      aircraft: flightKnown.aircraft,
      origin: originAirport,
      destination: destinationAirport,
      date: flightDate,
      status: 'scheduled',
      message: 'Flight verified in external database',
    };
  } else if (flightKnown && (originValid || destValid)) {
    return {
      found: true,
      matches: false,
      partial: true,
      flightNumber: flightKey,
      airline: flightKnown.airline,
      aircraft: flightKnown.aircraft,
      origin: originAirport,
      destination: destinationAirport,
      date: flightDate,
      status: 'partial_match',
      message: 'Flight exists but airports or date may not match exactly',
    };
  } else {
    return {
      found: false,
      matches: false,
      partial: false,
      flightNumber: flightKey,
      message: 'Flight not found in database (may be charter, private, or regional flight)',
    };
  }
};

/**
 * Check flight schedule for a specific date range
 * Useful for recurring flights
 */
export const checkFlightSchedule = async (
  flightNumber,
  startDate,
  endDate
) => {
  try {
    const { airline_iata, flight_number } = formatFlightNumber(flightNumber);

    // In production, this would query Aviationstack's schedule endpoint
    // For now, return simulated data
    return {
      flight: `${airline_iata}${flight_number}`,
      scheduleDates: [startDate, endDate],
      frequency: 'Daily',
      status: 'Active',
    };
  } catch (error) {
    console.error('Flight schedule check error:', error);
    throw error;
  }
};

/**
 * Get flight details including route, aircraft, and schedule
 */
export const getFlightDetails = async (flightNumber) => {
  try {
    // Simulated flight details
    const flightDetails = {
      'AA100': {
        airline: 'American Airlines',
        aircraft: 'Boeing 777-300ER',
        routes: ['JFK-LAX', 'JFK-SFO', 'JFK-ORD'],
        schedule: 'Daily',
        capacity: 350,
      },
      'BA456': {
        airline: 'British Airways',
        aircraft: 'Airbus A380-800',
        routes: ['LHR-JFK', 'LHR-LAX', 'LHR-HND'],
        schedule: 'Multiple daily',
        capacity: 560,
      },
    };

    return flightDetails[flightNumber] || null;
  } catch (error) {
    console.error('Error retrieving flight details:', error);
    throw error;
  }
};

/**
 * Fetch flight route information to auto-fill origin and destination airports
 * Takes: airline code, flight number, date
 * Returns: {originAirport: 'XXX', destinationAirport: 'XXX'}
 * This calls the backend endpoint which queries both Amadeus and Aviationstack APIs
 */
export const fetchFlightRoute = async (airlineCode, flightNumber, dateOfTravel) => {
  try {
    console.log('🔍 [AUTO-FILL] Fetching flight route details...');
    console.log(`   Airline: ${airlineCode} | Flight: ${flightNumber} | Date: ${dateOfTravel}`);

    // Call backend endpoint instead of calling APIs directly from frontend
    const params = new URLSearchParams({
      airline: airlineCode,
      flightNumber: flightNumber,
      dateOfTravel: dateOfTravel,
    });

    const response = await fetch(`/api/flight-route?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`   ⚠️  Backend request failed (${response.status})`);
      return null;
    }

    const data = await response.json();

    if (data.success && data.data) {
      const result = {
        originAirport: data.data.originAirport,
        destinationAirport: data.data.destinationAirport,
        airline: data.data.airline,
        aircraft: data.data.aircraft,
        departure: data.data.departure,
        arrival: data.data.arrival,
        source: data.data.source,
      };

      console.log(`   ✅ Route found via backend`);
      console.log(`   📍 ${result.originAirport} → ${result.destinationAirport}`);
      console.log(`   ✈️  Aircraft: ${result.aircraft} | Source: ${result.source}`);

      return result;
    }

    console.log('   ℹ️  No route data received from backend');
    return null;

  } catch (error) {
    console.warn('   ⚠️  Error fetching flight route:', error.message);
    return null;
  }
};

