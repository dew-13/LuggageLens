/**
 * Flight Routes Controller
 * Handles flight route requests for auto-filling airport information
 */

const { getFlightRoute } = require('../services/FlightRouteService');

/**
 * GET /api/flight-route
 * Fetch flight route details to auto-fill airports
 * Query params: airline, flightNumber, dateOfTravel
 * Returns: {originAirport, destinationAirport, airline, aircraft, departure, arrival, status}
 */
const getFlightRouteHandler = async (req, res) => {
  try {
    const { flight, date } = req.query;
    
    // Support both old format (airline, flightNumber, dateOfTravel) and new format (flight, date)
    const airline = req.query.airline;
    const flightNumber = req.query.flightNumber || flight;
    const dateOfTravel = req.query.dateOfTravel || date;

    // Validate required parameters
    if (!flightNumber || !dateOfTravel) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['flight (or airline+flightNumber)', 'date (or dateOfTravel)'],
      });
    }

    console.log(`\n📡 [API] Flight route request: ${flightNumber} on ${dateOfTravel}`);

    // Fetch flight route from APIs
    const flightRoute = await getFlightRoute(airline || flightNumber.slice(0, 2), flightNumber.slice(-flightNumber.length + 2) || flightNumber, dateOfTravel);

    if (!flightRoute) {
      return res.status(404).json({
        error: 'Flight not found',
        message: 'Could not find flight information for the given parameters',
      });
    }

    // Return flight route information
    res.json({
      success: true,
      data: flightRoute,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ [API] Error in flight route handler:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

module.exports = {
  getFlightRouteHandler,
};
