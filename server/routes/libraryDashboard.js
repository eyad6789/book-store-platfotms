const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getLibraryDashboard, getLibraryAnalytics } = require('../controllers/libraryDashboardController');
const { 
  shareBook, 
  getSharedBooks, 
  updateBookShare, 
  deleteBookShare,
  trackShareView,
  trackShareClick
} = require('../controllers/bookSharingController');

const router = express.Router();

// Dashboard routes
// @route   GET /api/library/:bookstoreId/dashboard
// @desc    Get library dashboard data
// @access  Private (Bookstore owners only)
router.get('/:bookstoreId/dashboard', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  getLibraryDashboard
);

// @route   GET /api/library/:bookstoreId/analytics
// @desc    Get detailed analytics for library
// @access  Private (Bookstore owners only)
router.get('/:bookstoreId/analytics', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  getLibraryAnalytics
);

// Book sharing routes
// @route   POST /api/library/books/:bookId/share
// @desc    Share a book (promotional feature)
// @access  Private (Bookstore owners only)
router.post('/books/:bookId/share', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  shareBook
);

// @route   GET /api/library/:bookstoreId/shared-books
// @desc    Get shared books for a bookstore
// @access  Private (Bookstore owners only)
router.get('/:bookstoreId/shared-books', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  getSharedBooks
);

// @route   PUT /api/library/shares/:shareId
// @desc    Update book share
// @access  Private (Bookstore owners only)
router.put('/shares/:shareId', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  updateBookShare
);

// @route   DELETE /api/library/shares/:shareId
// @desc    Delete/deactivate book share
// @access  Private (Bookstore owners only)
router.delete('/shares/:shareId', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  deleteBookShare
);

// Public tracking routes (for shared links)
// @route   POST /api/library/shares/:shareId/track-view
// @desc    Track share view (public endpoint)
// @access  Public
router.post('/shares/:shareId/track-view', trackShareView);

// @route   POST /api/library/shares/:shareId/track-click
// @desc    Track share click (public endpoint)
// @access  Public
router.post('/shares/:shareId/track-click', trackShareClick);

module.exports = router;
