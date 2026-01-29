const express = require('express');
const router = express.Router();
const multer = require('multer');
const luggageService = require('../services/luggageService');
const { authenticateToken: auth } = require('../middleware/auth'); // Fix: Destructure the named export

// Configure Multer for memory storage (we'll upload to Supabase directly)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

/**
 * POST /api/luggage/report
 * Report lost luggage:
 * 1. Uploads image
 * 2. Creates record with AI embedding
 * 3. Immediately searches for matches
 */
router.post('/report', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image of the luggage' });
    }

    const { description, color, type, brand, lost_date, metadata: metadataString } = req.body;
    const userId = req.user.userId;

    console.log(`📦 Processing lost luggage report for user: ${userId}`);

    // Parse metadata if sent as JSON string
    let metadata = {};
    if (metadataString) {
      try {
        metadata = JSON.parse(metadataString);
      } catch (e) {
        console.warn('Failed to parse metadata JSON:', e.message);
      }
    }

    // Merge individual fields into metadata
    metadata = {
      ...metadata,
      color,
      type,
      brand,
      lost_date // Store the explicitly passed lost_date
    };

    // Call our smart service
    const lostLuggage = await luggageService.reportLostLuggage(
      userId,
      req.file,
      description,
      metadata
    );

    console.log('✅ Luggage reported:', lostLuggage.id);

    // Immediately find matches (Gracefully handle failures)
    let matches = [];
    try {
      console.log('🔍 Searching for matches...');
      matches = await luggageService.findMatches(lostLuggage.id);
      console.log(`✅ Found ${matches.length} potential matches`);
    } catch (matchError) {
      console.warn('⚠️ Match search failed (but report saved):', matchError.message);
      // We don't fail the request, just return empty matches
    }

    res.status(201).json({
      message: 'Luggage reported successfully',
      luggage: lostLuggage,
      potentialMatches: matches
    });

  } catch (error) {
    console.error('Report Error:', error);
    res.status(500).json({ message: error.message || 'Failed to report luggage' });
  }
});



/**
 * GET /api/luggage/my-cases
 * Get all luggage cases for the logged-in user
 */
router.get('/my-cases', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cases = await luggageService.getUserLuggage(userId);
    res.json(cases);
  } catch (error) {
    console.error('Get Cases Error:', error);
    res.status(500).json({ message: 'Failed to retrieve cases' });
  }
});

/**
 * GET /api/luggage/details/:id
 * Get single case details (ensuring ownership)
 */
router.get('/details/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const luggageId = req.params.id;

    // Reuse getUserLuggage but filter, or add new service method
    // For efficiency, let's query directly here or add service method
    // I'll add a simple query here since service is already exposed
    const userLuggage = await luggageService.getUserLuggage(userId);
    const item = userLuggage.find(l => l.id === luggageId);

    if (!item) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get Case Detail Error:', error);
    res.status(500).json({ message: 'Failed to retrieve case details' });
  }
});

/**
 * GET /api/luggage/matches
 * Get all matches for the logged-in user
 */
router.get('/matches', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const matches = await luggageService.getUserMatches(userId);
    res.json(matches);
  } catch (error) {
    console.error('Get Matches Error:', error);
    res.status(500).json({ message: 'Failed to retrieve matches' });
  }
});

module.exports = router;
