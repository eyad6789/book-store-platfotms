const express = require('express');
const { Op } = require('sequelize');
const { Wishlist, Book, Bookstore, Category } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const wishlist = await Wishlist.findAndCountAll({
      where: { user_id: req.user.id },
      include: [{
        model: Book,
        as: 'book',
        where: { is_active: true },
        include: [
          {
            model: Bookstore,
            as: 'bookstore',
            attributes: ['id', 'name', 'name_arabic', 'governorate'],
            where: { is_approved: true, is_active: true }
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'name_ar'],
            required: false
          }
        ]
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    const totalPages = Math.ceil(wishlist.count / limit);

    res.json({
      success: true,
      wishlist: wishlist.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: wishlist.count,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في جلب قائمة الأمنيات'
    });
  }
});

// @route   POST /api/wishlist/:bookId
// @desc    Add book to wishlist
// @access  Private
router.post('/:bookId', authenticateToken, async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const userId = req.user.id;

    // Check if book exists and is active
    const book = await Book.findOne({
      where: { id: bookId, is_active: true },
      include: [{
        model: Bookstore,
        as: 'bookstore',
        where: { is_approved: true, is_active: true }
      }]
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'الكتاب غير موجود أو غير متاح'
      });
    }

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({
      where: { user_id: userId, book_id: bookId }
    });

    if (existingWishlist) {
      return res.status(400).json({
        success: false,
        error: 'الكتاب موجود بالفعل في قائمة الأمنيات'
      });
    }

    // Add to wishlist
    await Wishlist.create({
      user_id: userId,
      book_id: bookId
    });

    res.status(201).json({
      success: true,
      message: 'تم إضافة الكتاب إلى قائمة الأمنيات بنجاح'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في إضافة الكتاب إلى قائمة الأمنيات'
    });
  }
});

// @route   DELETE /api/wishlist/:bookId
// @desc    Remove book from wishlist
// @access  Private
router.delete('/:bookId', authenticateToken, async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const userId = req.user.id;

    const wishlistItem = await Wishlist.findOne({
      where: { user_id: userId, book_id: bookId }
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        error: 'الكتاب غير موجود في قائمة الأمنيات'
      });
    }

    await wishlistItem.destroy();

    res.json({
      success: true,
      message: 'تم إزالة الكتاب من قائمة الأمنيات بنجاح'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في إزالة الكتاب من قائمة الأمنيات'
    });
  }
});

// @route   DELETE /api/wishlist
// @desc    Clear entire wishlist
// @access  Private
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await Wishlist.destroy({
      where: { user_id: userId }
    });

    res.json({
      success: true,
      message: 'تم مسح قائمة الأمنيات بالكامل'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في مسح قائمة الأمنيات'
    });
  }
});

// @route   GET /api/wishlist/check/:bookId
// @desc    Check if book is in user's wishlist
// @access  Private
router.get('/check/:bookId', authenticateToken, async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const userId = req.user.id;

    const wishlistItem = await Wishlist.findOne({
      where: { user_id: userId, book_id: bookId }
    });

    res.json({
      success: true,
      wishlisted: !!wishlistItem
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في فحص قائمة الأمنيات'
    });
  }
});

// @route   POST /api/wishlist/bulk
// @desc    Add multiple books to wishlist
// @access  Private
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { bookIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'يجب تحديد قائمة بالكتب'
      });
    }

    // Check which books exist and are active
    const validBooks = await Book.findAll({
      where: { 
        id: { [Op.in]: bookIds },
        is_active: true 
      },
      include: [{
        model: Bookstore,
        as: 'bookstore',
        where: { is_approved: true, is_active: true }
      }],
      attributes: ['id']
    });

    const validBookIds = validBooks.map(book => book.id);

    // Check which books are already in wishlist
    const existingWishlist = await Wishlist.findAll({
      where: { 
        user_id: userId,
        book_id: { [Op.in]: validBookIds }
      },
      attributes: ['book_id']
    });

    const existingBookIds = existingWishlist.map(item => item.book_id);
    const newBookIds = validBookIds.filter(id => !existingBookIds.includes(id));

    // Add new books to wishlist
    if (newBookIds.length > 0) {
      const wishlistItems = newBookIds.map(bookId => ({
        user_id: userId,
        book_id: bookId
      }));

      await Wishlist.bulkCreate(wishlistItems);
    }

    res.json({
      success: true,
      message: `تم إضافة ${newBookIds.length} كتاب إلى قائمة الأمنيات`,
      added: newBookIds.length,
      skipped: existingBookIds.length,
      invalid: bookIds.length - validBookIds.length
    });
  } catch (error) {
    console.error('Bulk add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في إضافة الكتب إلى قائمة الأمنيات'
    });
  }
});

module.exports = router;
