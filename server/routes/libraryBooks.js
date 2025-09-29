const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { 
  addLibraryBook, 
  getLibraryBooks, 
  getLibraryBook,
  updateLibraryBook, 
  deleteLibraryBook,
  upload 
} = require('../controllers/libraryBooksController');

const router = express.Router();

// @route   POST /api/library/:bookstoreId/books
// @desc    Add new library book
// @access  Private (Bookstore owners only)
router.post('/:bookstoreId/books', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  upload.single('cover_image'),
  addLibraryBook
);

// @route   GET /api/library/:bookstoreId/books
// @desc    Get library books for a bookstore
// @access  Private (Bookstore owners only)
router.get('/:bookstoreId/books', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  getLibraryBooks
);

// @route   GET /api/library/books/:bookId
// @desc    Get single library book
// @access  Private (Bookstore owners only)
router.get('/books/:bookId', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  getLibraryBook
);

// @route   PUT /api/library/books/:bookId
// @desc    Update library book
// @access  Private (Bookstore owners only)
router.put('/books/:bookId', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  upload.single('cover_image'),
  updateLibraryBook
);

// @route   DELETE /api/library/books/:bookId
// @desc    Delete library book
// @access  Private (Bookstore owners only)
router.delete('/books/:bookId', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  deleteLibraryBook
);

module.exports = router;
