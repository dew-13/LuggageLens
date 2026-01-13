const express = require('express');
const router = express.Router();

/**
 * GET /api/matches/:caseId
 * Get matches for a luggage case
 */
router.get('/:caseId', (req, res) => {
  // TODO: Implement get matches
  res.json({ message: 'Get matches endpoint' });
});

/**
 * POST /api/matches/find
 * Find matches for a luggage image
 * Calls AI model to compare images
 */
router.post('/find', (req, res) => {
  // TODO: Implement find matches
  res.json({ message: 'Find matches endpoint' });
});

/**
 * PUT /api/matches/:matchId
 * Update match status (accept/reject)
 */
router.put('/:matchId', (req, res) => {
  // TODO: Implement update match
  res.json({ message: 'Update match endpoint' });
});

module.exports = router;
