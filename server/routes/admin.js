const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { User, Bookstore, Book, Order, OrderItem, Category, LibraryBook, UserActivity, LibraryReview, BookReview } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// Middleware to ensure only admins can access these routes
router.use(authenticateToken);
router.use(requireRole('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));

    // Get basic statistics
    const totalUsers = await User.count();
    const totalBookstores = await Bookstore.count();
    const approvedBookstores = await Bookstore.count({ where: { is_approved: true } });
    const pendingBookstores = await Bookstore.count({ where: { is_approved: false } });
    const totalBooks = await Book.count();
    const totalOrders = await Order.count();

    // Get recent activity
    const recentUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'full_name', 'email', 'role', 'createdAt']
    });

    const recentBookstores = await Bookstore.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['full_name', 'email']
        }
      ]
    });

    const dashboardData = {
      overview: {
        totalUsers,
        totalBookstores,
        approvedBookstores,
        pendingBookstores,
        totalBooks,
        totalOrders
      },
      users: {
        total: totalUsers,
        recent: recentUsers
      },
      libraries: {
        total: totalBookstores,
        approved: approvedBookstores,
        pending: pendingBookstores,
        rejected: totalBookstores - approvedBookstores - pendingBookstores,
        recent: recentBookstores
      },
      books: {
        total: totalBooks,
        approved: totalBooks, // Assuming all books are approved for now
        pending: 0,
        shared: await LibraryBook.count() || 0
      },
      engagement: {
        totalViews: 0, // Placeholder
        totalShares: 0, // Placeholder
        activeUsers: totalUsers
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: 'Something went wrong while fetching the dashboard data'
    });
  }
});

// @route   GET /api/admin/bookstores/pending
// @desc    Get pending bookstores for approval
// @access  Private (Admin only)
router.get('/bookstores/pending', async (req, res) => {
  try {
    const pendingBookstores = await Bookstore.findAll({
      where: { is_approved: false },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      bookstores: pendingBookstores
    });

  } catch (error) {
    console.error('Error fetching pending bookstores:', error);
    res.status(500).json({
      error: 'Failed to fetch pending bookstores',
      message: 'Something went wrong while fetching pending bookstores'
    });
  }
});

// @route   PUT /api/admin/bookstores/:id/approve
// @desc    Approve a bookstore
// @access  Private (Admin only)
router.put('/bookstores/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const bookstore = await Bookstore.findByPk(id);
    if (!bookstore) {
      return res.status(404).json({
        error: 'Bookstore not found',
        message: 'The specified bookstore does not exist'
      });
    }

    await bookstore.update({
      is_approved: true,
      is_active: true
    });

    // Log the approval activity
    await UserActivity.create({
      user_id: req.user.id,
      activity_type: 'bookstore_approved',
      description: `Admin approved bookstore: ${bookstore.name}`,
      metadata: {
        bookstore_id: bookstore.id,
        bookstore_name: bookstore.name,
        admin_id: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Bookstore approved successfully',
      bookstore: bookstore
    });

  } catch (error) {
    console.error('Error approving bookstore:', error);
    res.status(500).json({
      error: 'Failed to approve bookstore',
      message: 'Something went wrong while approving the bookstore'
    });
  }
});

// @route   PUT /api/admin/bookstores/:id/reject
// @desc    Reject a bookstore
// @access  Private (Admin only)
router.put('/bookstores/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const bookstore = await Bookstore.findByPk(id);
    if (!bookstore) {
      return res.status(404).json({
        error: 'Bookstore not found',
        message: 'The specified bookstore does not exist'
      });
    }

    await bookstore.update({
      is_approved: false,
      is_active: false,
      rejection_reason: reason || 'لم يتم تحديد سبب الرفض'
    });

    // Log the rejection activity
    await UserActivity.create({
      user_id: req.user.id,
      activity_type: 'bookstore_rejected',
      description: `Admin rejected bookstore: ${bookstore.name}`,
      metadata: {
        bookstore_id: bookstore.id,
        bookstore_name: bookstore.name,
        rejection_reason: reason,
        admin_id: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Bookstore rejected successfully',
      bookstore: bookstore
    });

  } catch (error) {
    console.error('Error rejecting bookstore:', error);
    res.status(500).json({
      error: 'Failed to reject bookstore',
      message: 'Something went wrong while rejecting the bookstore'
    });
  }
});

// @route   GET /api/admin/books/pending
// @desc    Get pending books for approval
// @access  Private (Admin only)
router.get('/books/pending', async (req, res) => {
  try {
    const pendingBooks = await LibraryBook.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Bookstore,
          as: 'bookstore',
          attributes: ['id', 'name', 'name_arabic'],
          include: [{
            model: User,
            as: 'owner',
            attributes: ['id', 'full_name', 'email']
          }]
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'name_ar']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      books: pendingBooks,
      count: pendingBooks.length
    });

  } catch (error) {
    console.error('Error fetching pending books:', error);
    res.status(500).json({
      error: 'Failed to fetch pending books',
      message: 'حدث خطأ في تحميل الكتب المعلقة'
    });
  }
});

// @route   PUT /api/admin/books/:id/approve
// @desc    Approve a library book
// @access  Private (Admin only)
router.put('/books/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const book = await LibraryBook.findByPk(id, {
      include: [{
        model: Bookstore,
        as: 'bookstore'
      }]
    });

    if (!book) {
      return res.status(404).json({
        error: 'Book not found',
        message: 'الكتاب غير موجود'
      });
    }

    await book.update({
      status: 'approved',
      approved_by: req.user.id,
      approved_at: new Date()
    });

    // Log the approval activity (temporarily disabled)
    // await UserActivity.create({
    //   user_id: req.user.id,
    //   activity_type: 'book_approved',
    //   entity_type: 'library_book',
    //   entity_id: book.id,
    //   metadata: {
    //     book_id: book.id,
    //     book_title: book.title_ar || book.title,
    //     bookstore_id: book.bookstore_id,
    //     admin_id: req.user.id
    //   }
    // });

    res.json({
      success: true,
      message: 'تم الموافقة على الكتاب بنجاح',
      book: book
    });

  } catch (error) {
    console.error('Error approving book:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to approve book',
      message: 'حدث خطأ في الموافقة على الكتاب',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/admin/books/:id/reject
// @desc    Reject a library book
// @access  Private (Admin only)
router.put('/books/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const book = await LibraryBook.findByPk(id);
    if (!book) {
      return res.status(404).json({
        error: 'Book not found',
        message: 'الكتاب غير موجود'
      });
    }

    await book.update({
      status: 'rejected',
      rejection_reason: reason || 'لم يتم تحديد سبب الرفض',
      approved_by: req.user.id,
      approved_at: new Date()
    });

    // Log the rejection activity (temporarily disabled)
    // await UserActivity.create({
    //   user_id: req.user.id,
    //   activity_type: 'book_rejected',
    //   entity_type: 'library_book',
    //   entity_id: book.id,
    //   metadata: {
    //     book_id: book.id,
    //     book_title: book.title_ar || book.title,
    //     rejection_reason: reason,
    //     admin_id: req.user.id
    //   }
    // });

    res.json({
      success: true,
      message: 'تم رفض الكتاب',
      book: book
    });

  } catch (error) {
    console.error('Error rejecting book:', error);
    res.status(500).json({
      error: 'Failed to reject book',
      message: 'حدث خطأ في رفض الكتاب'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (role) {
      whereClause.role = role;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password_hash'] }
    });

    res.json({
      success: true,
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'Something went wrong while fetching users'
    });
  }
});

// @route   GET /api/admin/reports/export
// @desc    Export admin reports
// @access  Private (Admin only)
router.get('/reports/export', async (req, res) => {
  try {
    const { type, days = 30 } = req.query;
    
    // This is a placeholder for report export functionality
    // In a real implementation, you would generate Excel/PDF reports here
    
    res.json({
      success: true,
      message: 'Report export functionality will be implemented',
      type,
      days
    });

  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      error: 'Failed to export report',
      message: 'Something went wrong while exporting the report'
    });
  }
});

// @route   GET /api/admin/ratings/analytics
// @desc    Get rating analytics for admin dashboard
// @access  Private (Admin only)
router.get('/ratings/analytics', async (req, res) => {
  try {
    // Get total ratings count
    const totalLibraryRatings = await LibraryReview.count();
    const totalBookRatings = await BookReview.count();
    const totalRatings = totalLibraryRatings + totalBookRatings;

    // Get average ratings
    const avgLibraryRating = await LibraryReview.findOne({
      attributes: [[fn('AVG', col('rating')), 'avg_rating']]
    });
    
    const avgBookRating = await BookReview.findOne({
      attributes: [[fn('AVG', col('rating')), 'avg_rating']]
    });

    // Calculate overall average
    const overallAverage = totalRatings > 0 
      ? ((parseFloat(avgLibraryRating?.dataValues?.avg_rating || 0) * totalLibraryRatings) + 
         (parseFloat(avgBookRating?.dataValues?.avg_rating || 0) * totalBookRatings)) / totalRatings
      : 0;

    // Get rating distribution for library reviews
    const libraryRatingDistribution = await LibraryReview.findAll({
      attributes: [
        'rating',
        [fn('COUNT', col('rating')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']]
    });

    // Get rating distribution for book reviews
    const bookRatingDistribution = await BookReview.findAll({
      attributes: [
        'rating',
        [fn('COUNT', col('rating')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']]
    });

    // Combine distributions
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    libraryRatingDistribution.forEach(item => {
      distribution[item.rating] += parseInt(item.dataValues.count);
    });
    
    bookRatingDistribution.forEach(item => {
      distribution[item.rating] += parseInt(item.dataValues.count);
    });

    // Get top rated libraries
    const topRatedLibraries = await Bookstore.findAll({
      where: {
        rating: { [Op.gt]: 0 },
        is_active: true,
        is_approved: true
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['full_name']
        }
      ],
      attributes: [
        'id', 'name', 'name_arabic', 'rating', 'total_reviews',
        [literal('(SELECT COUNT(*) FROM books WHERE bookstore_id = Bookstore.id)'), 'total_books']
      ],
      order: [['rating', 'DESC'], ['total_reviews', 'DESC']],
      limit: 10
    });

    const analyticsData = {
      stats: {
        totalRatings,
        libraryRatings: totalLibraryRatings,
        bookRatings: totalBookRatings,
        averageRating: parseFloat(overallAverage.toFixed(2)),
        distribution
      },
      topRatedLibraries: topRatedLibraries.map(library => ({
        id: library.id,
        name: library.name,
        name_arabic: library.name_arabic,
        rating: parseFloat(library.rating),
        total_reviews: library.total_reviews,
        total_books: parseInt(library.dataValues.total_books),
        owner: library.owner
      }))
    };

    res.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error fetching rating analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch rating analytics',
      message: 'Something went wrong while fetching rating analytics'
    });
  }
});

module.exports = router;
