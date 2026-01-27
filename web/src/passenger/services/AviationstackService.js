/**
 * Aviationstack API Service
 * Verifies flight details against real-time flight data
 * API: https://aviationstack.com/
 * Key: b819f80ba59d5471b397c6f9a35d2d85
 */

const AVIATIONSTACK_API_KEY = 'b819f80ba59d5471b397c6f9a35d2d85';
const AVIATIONSTACK_BASE_URL = 'http://api.aviationstack.com/v1';

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
 * Falls back to simulated data if backend is unavailable
 */
export const fetchFlightRoute = async (airlineCode, flightNumber, dateOfTravel) => {
  try {
    console.log('🔍 [AUTO-FILL] Fetching flight route details...');
    console.log(`   Airline: ${airlineCode} | Flight: ${flightNumber} | Date: ${dateOfTravel}`);

    // Try backend first (with better error handling)
    try {
      const { default: apiClient } = await import('../../services/apiClient');

      // Combine airline code and flight number (e.g., "QR" + "110" = "QR110")
      // Careful not to duplicate the airline code if already present in flightNumber (e.g. UL + UL605)
      let fullFlightNumber = flightNumber.trim().toUpperCase();
      const cleanAirline = airlineCode.trim().toUpperCase();

      if (!fullFlightNumber.startsWith(cleanAirline)) {
        fullFlightNumber = `${cleanAirline}${fullFlightNumber}`;
      }

      const params = new URLSearchParams({
        flight: fullFlightNumber,
        date: dateOfTravel,
      });

      const response = await apiClient.get(`/flight-route?${params.toString()}`);
      const data = response.data;

      if (data.success && data.data) {
        const result = {
          originAirport: data.data.originAirport,
          destinationAirport: data.data.destinationAirport,
          originIata: data.data.originIata,
          destinationIata: data.data.destinationIata,
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
    } catch (backendError) {
      console.warn('   ⚠️  Backend unavailable, using simulated flight data...');
      console.warn(`   Reason: ${backendError.message}`);
    }

    // Fallback: Use simulated data
    const simulatedResult = getSimulatedFlightData(airlineCode, flightNumber, dateOfTravel);
    if (simulatedResult) {
      console.log(`   ✅ Using simulated flight data (for testing)`);
      console.log(`   📍 ${simulatedResult.originAirport} → ${simulatedResult.destinationAirport}`);
      return simulatedResult;
    }

    console.log('   ℹ️  No route data available');
    return null;

  } catch (error) {
    console.warn('   ⚠️  Error fetching flight route:', error.message);
    if (error.response?.status === 404) {
      console.warn('   ℹ️  Backend endpoint not found - using simulated data');
    }

    // Final fallback to simulated data
    const fallbackResult = getSimulatedFlightData(airlineCode, flightNumber, dateOfTravel);
    return fallbackResult || null;
  }
};

/**
 * Simulated flight database for testing
 * Maps flight numbers to typical routes
 */
const getSimulatedFlightData = (airlineCode, flightNumber, dateOfTravel) => {
  const fullFlightNumber = `${airlineCode}${flightNumber}`;

  // Extensive database of common flights
  const flightDatabase = {
    // Middle East / Indian subcontinent
    'QR110': { origin: 'DOH', destination: 'BOM', airline: 'Qatar Airways', aircraft: 'B787' },
    'QR111': { origin: 'BOM', destination: 'DOH', airline: 'Qatar Airways', aircraft: 'B787' },
    'QR200': { origin: 'DOH', destination: 'DEL', airline: 'Qatar Airways', aircraft: 'B777' },
    'QR201': { origin: 'DEL', destination: 'DOH', airline: 'Qatar Airways', aircraft: 'B777' },
    'EK500': { origin: 'DXB', destination: 'BOM', airline: 'Emirates', aircraft: 'B777' },
    'EK501': { origin: 'BOM', destination: 'DXB', airline: 'Emirates', aircraft: 'B777' },
    'EY100': { origin: 'AUH', destination: 'DEL', airline: 'Etihad Airways', aircraft: 'B787' },

    // US Routes
    'AA100': { origin: 'JFK', destination: 'LAX', airline: 'American Airlines', aircraft: 'B777' },
    'AA101': { origin: 'LAX', destination: 'JFK', airline: 'American Airlines', aircraft: 'B777' },
    'AA456': { origin: 'LAX', destination: 'ORD', airline: 'American Airlines', aircraft: 'B767' },
    'AA789': { origin: 'SFO', destination: 'JFK', airline: 'American Airlines', aircraft: 'B787' },
    'DL123': { origin: 'ATL', destination: 'LAX', airline: 'Delta Airlines', aircraft: 'B777' },

    // Europe
    'BA456': { origin: 'LHR', destination: 'JFK', airline: 'British Airways', aircraft: 'B777' },
    'BA205': { origin: 'LHR', destination: 'CDG', airline: 'British Airways', aircraft: 'A320' },
    'AF555': { origin: 'CDG', destination: 'JFK', airline: 'Air France', aircraft: 'B777' },
    'LH501': { origin: 'FRA', destination: 'JFK', airline: 'Lufthansa', aircraft: 'B777' },

    // Asia Pacific
    'SQ006': { origin: 'SIN', destination: 'JFK', airline: 'Singapore Airlines', aircraft: 'B777' },
    'ANA212': { origin: 'HND', destination: 'LAX', airline: 'All Nippon Airways', aircraft: 'B787' },
    'CI005': { origin: 'TPE', destination: 'LAX', airline: 'China Airlines', aircraft: 'B777' },

    // India Domestic & Regional
    '6E100': { origin: 'DEL', destination: 'BOM', airline: 'IndiGo', aircraft: 'A320' },
    '6E456': { origin: 'BLR', destination: 'DEL', airline: 'IndiGo', aircraft: 'A320' },
    'AI202': { origin: 'DEL', destination: 'MUM', airline: 'Air India', aircraft: 'B777' },
    'UL605': { origin: 'MEL', destination: 'CMB', airline: 'SriLankan', aircraft: 'A330' },
    'UL606': { origin: 'CMB', destination: 'MEL', airline: 'SriLankan', aircraft: 'A330' },
  };

  const flightData = flightDatabase[fullFlightNumber];

  if (flightData) {
    return {
      originAirport: flightData.origin,
      destinationAirport: flightData.destination,
      originIata: flightData.origin,
      destinationIata: flightData.destination,
      airline: flightData.airline,
      aircraft: flightData.aircraft,
      departure: `${dateOfTravel}T10:00:00Z`,
      arrival: `${dateOfTravel}T18:00:00Z`,
      source: 'simulated',
    };
  }

  return null;
};

