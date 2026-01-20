/**
 * Flight Route Routes
 * Endpoints for fetching flight information for auto-filling
 */

const express = require('express');
const router = express.Router();
const { getFlightRouteHandler } = require('../controllers/flightRouteController');

/**
 * GET /api/flight-route
 * Fetch flight route details
 * Query: airline, flightNumber, dateOfTravel
 */
router.get('/', getFlightRouteHandler);

module.exports = router;
