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

// @route   PUT /api/library/books/:bookId/availability
// @desc    Update library book availability status
// @access  Private (Bookstore owners only)
router.put('/books/:bookId/availability', 
  authenticateToken, 
  requireRole('bookstore_owner'),
  async (req, res) => {
    try {
      console.log('🔍 Update availability request:', {
        bookId: req.params.bookId,
        body: req.body,
        user: req.user ? { id: req.user.id, bookstore_id: req.user.bookstore_id } : 'No user'
      });
      
      const { bookId } = req.params;
      const { availability_status } = req.body;
      
      // Validate availability status
      const validStatuses = ['available', 'unavailable', 'coming_soon'];
      if (!validStatuses.includes(availability_status)) {
        console.log('❌ Invalid status:', availability_status);
        return res.status(400).json({
          success: false,
          error: 'حالة التوفر غير صحيحة'
        });
      }
      
      const { LibraryBook, Bookstore } = require('../models');
      
      // Find user's bookstore
      const userBookstore = await Bookstore.findOne({
        where: { owner_id: req.user.id }
      });
      
      if (!userBookstore) {
        console.log('❌ No bookstore found for user:', req.user.id);
        return res.status(403).json({
          success: false,
          error: 'ليس لديك مكتبة مسجلة'
        });
      }
      
      console.log('✅ Found user bookstore:', { id: userBookstore.id, name: userBookstore.name });
      
      // Find and update the book
      console.log('🔍 Searching for book:', { bookId, bookstore_id: userBookstore.id });
      const book = await LibraryBook.findOne({
        where: { 
          id: bookId,
          bookstore_id: userBookstore.id
        }
      });
      
      if (!book) {
        console.log('❌ Book not found');
        return res.status(404).json({
          success: false,
          error: 'الكتاب غير موجود'
        });
      }
      
      console.log('✅ Book found, updating availability_status to:', availability_status);
      console.log('📋 Book before update:', { id: book.id, availability_status: book.availability_status });
      
      await book.update({ availability_status });
      await book.reload(); // Reload to get fresh data from DB
      
      console.log('📋 Book after update:', { id: book.id, availability_status: book.availability_status });
      console.log('✅ Book updated successfully');
      
      res.json({
        success: true,
        message: 'تم تحديث حالة التوفر بنجاح',
        book: book
      });
      
    } catch (error) {
      console.error('❌ Update availability error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ في تحديث حالة التوفر',
        details: error.message
      });
    }
  }
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
