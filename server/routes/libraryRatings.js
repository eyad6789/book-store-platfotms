const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  createLibraryReview, 
  getLibraryReviews, 
  updateLibraryReview, 
  deleteLibraryReview,
  getLibraryRatingStats,
  markReviewHelpful
} = require('../controllers/libraryRatingsController');

const router = express.Router();

// @route   POST /api/ratings/library/:bookstoreId/review
// @desc    Create a review for a library
// @access  Private (Authenticated users only)
router.post('/library/:bookstoreId/review', 
  authenticateToken, 
  createLibraryReview
);

// @route   GET /api/ratings/library/:bookstoreId/reviews
// @desc    Get all reviews for a library
// @access  Public
router.get('/library/:bookstoreId/reviews', getLibraryReviews);

// @route   GET /api/ratings/library/:bookstoreId/stats
// @desc    Get rating statistics for a library
// @access  Public
router.get('/library/:bookstoreId/stats', getLibraryRatingStats);

// @route   PUT /api/ratings/library/review/:reviewId
// @desc    Update a library review
// @access  Private (Review owner only)
router.put('/library/review/:reviewId', 
  authenticateToken, 
  updateLibraryReview
);

// @route   DELETE /api/ratings/library/review/:reviewId
// @desc    Delete a library review
// @access  Private (Review owner or admin)
router.delete('/library/review/:reviewId', 
  authenticateToken, 
  deleteLibraryReview
);

// @route   POST /api/ratings/library/review/:reviewId/helpful
// @desc    Mark a review as helpful
// @access  Private (Authenticated users only)
router.post('/library/review/:reviewId/helpful', 
  authenticateToken, 
  markReviewHelpful
);

module.exports = router;
