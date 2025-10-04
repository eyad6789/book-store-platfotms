const express = require('express');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Bookstore, User, Book, BookReview } = require('../models');
const { authenticateToken, requireRole, requireBookstoreOwner } = require('../middleware/auth');
const { validate, bookstoreSchemas } = require('../middleware/validation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'bookstores');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   GET /api/bookstores
// @desc    Get all approved bookstores
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { 
      is_approved: true, 
      is_active: true 
    };

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { name_arabic: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { description_arabic: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Sorting
    const validSortFields = ['created_at', 'name', 'rating'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: bookstores } = await Bookstore.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name']
        },
        {
          model: Book,
          as: 'books',
          attributes: ['id'],
          where: { is_active: true },
          required: false
        }
      ],
      order: [[sortField, sortDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // Add accurate book count to each bookstore
    const bookstoresWithCount = await Promise.all(bookstores.map(async (bookstore) => {
      const bookstoreData = bookstore.toJSON();
      
      // Get actual count of all books
      const bookCount = await Book.count({
        where: { 
          bookstore_id: bookstore.id,
          is_active: true 
        }
      });
      
      bookstoreData.book_count = bookCount;
      delete bookstoreData.books;
      return bookstoreData;
    }));

    const totalPages = Math.ceil(count / limit);

    res.json({
      bookstores: bookstoresWithCount,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Get bookstores error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookstores',
      message: 'Something went wrong while fetching bookstores'
    });
  }
});

// @route   GET /api/bookstores/my-bookstore
// @desc    Get current user's bookstore
// @access  Private (Bookstore owners only)
router.get('/my-bookstore', authenticateToken, async (req, res) => {
  try {
    console.log('📚 My-bookstore endpoint - User ID:', req.userId, 'Role:', req.user?.role);
    
    // Check if user is a bookstore owner
    if (req.user?.role !== 'bookstore_owner') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only bookstore owners can access this endpoint'
      });
    }

    // Find bookstore using Sequelize model (most reliable)
    const store = await Bookstore.findOne({
      where: { owner_id: req.userId },
      attributes: [
        'id', 'name', 'owner_id', 'phone', 'email', 
        'address', 'address_arabic', 'description', 
        'description_arabic', 'logo_url', 'is_approved', 
        'is_active', 'created_at', 'updated_at'
      ]
    });

    if (!store) {
      console.log('  ❌ No bookstore found for owner:', req.userId);
      return res.status(404).json({
        error: 'Bookstore not found',
        message: 'You have not registered a bookstore yet'
      });
    }

    console.log('  ✅ Bookstore found:', store.name, '(ID:', store.id, ')');

    // Return bookstore data
    res.json({ 
      bookstore: store
    });

  } catch (error) {
    console.error('❌ My-bookstore API error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookstore',
      message: 'Something went wrong while fetching your bookstore'
    });
  }
});

// @route   GET /api/bookstores/:id
// @desc    Get single bookstore by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const bookstore = await Bookstore.findOne({
      where: {
        id: req.params.id,
        is_approved: true,
        is_active: true
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name']
        }
      ]
    });

    if (!bookstore) {
      return res.status(404).json({
        error: 'Bookstore not found',
        message: 'The requested bookstore was not found'
      });
    }

    // Get bookstore's books (limited for display)
    const books = await Book.findAll({
      where: {
        bookstore_id: bookstore.id,
        is_active: true
      },
      order: [['created_at', 'DESC']],
      limit: 12
    });

    // Get actual total count of all books
    const totalBooksCount = await Book.count({
      where: {
        bookstore_id: bookstore.id,
        is_active: true
      }
    });

    // Get total reviews count for this bookstore
    let totalReviewsCount = 0;
    try {
      if (BookReview) {
        totalReviewsCount = await BookReview.count({
          include: [{
            model: Book,
            as: 'book',
            where: { bookstore_id: bookstore.id },
            attributes: [],
            required: true
          }]
        });
      }
    } catch (reviewError) {
      console.log('Could not count reviews:', reviewError.message);
      // Continue with 0 reviews if there's an error
    }

    const bookstoreData = bookstore.toJSON();
    bookstoreData.books = books;
    bookstoreData.book_count = totalBooksCount;
    bookstoreData.total_reviews = totalReviewsCount;

    res.json({ bookstore: bookstoreData });

  } catch (error) {
    console.error('Get bookstore error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookstore',
      message: 'Something went wrong while fetching the bookstore'
    });
  }
});

// @route   GET /api/bookstores/:id/books
// @desc    Get books from a specific bookstore
// @access  Public
router.get('/:id/books', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Verify bookstore exists and is approved
    const bookstore = await Bookstore.findOne({
      where: {
        id: req.params.id,
        is_approved: true,
        is_active: true
      }
    });

    if (!bookstore) {
      return res.status(404).json({
        error: 'Bookstore not found',
        message: 'The requested bookstore was not found'
      });
    }

    const whereClause = {
      bookstore_id: req.params.id,
      is_active: true
    };

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { title_arabic: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { author_arabic: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Category filter
    if (category) {
      whereClause[Op.or] = [
        ...(whereClause[Op.or] || []),
        { category: { [Op.iLike]: `%${category}%` } },
        { category_arabic: { [Op.iLike]: `%${category}%` } }
      ];
    }

    // Sorting
    const validSortFields = ['created_at', 'title', 'price', 'rating'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: books } = await Book.findAndCountAll({
      where: whereClause,
      order: [[sortField, sortDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      bookstore: {
        id: bookstore.id,
        name: bookstore.name,
        name_arabic: bookstore.name_arabic
      },
      books,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Get bookstore books error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookstore books',
      message: 'Something went wrong while fetching the bookstore books'
    });
  }
});

// @route   POST /api/bookstores/register
// @desc    Register a new bookstore
// @access  Private (Bookstore owners only)
router.post('/register', authenticateToken, requireRole('bookstore_owner'), validate(bookstoreSchemas.create), async (req, res) => {
  try {
    // Check if user already has a bookstore
    const existingBookstore = await Bookstore.findOne({
      where: { owner_id: req.userId }
    });

    if (existingBookstore) {
      return res.status(400).json({
        error: 'Bookstore already exists',
        message: 'You already have a registered bookstore'
      });
    }

    const bookstore = await Bookstore.create({
      ...req.body,
      owner_id: req.userId
    });

    const createdBookstore = await Bookstore.findByPk(bookstore.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Bookstore registered successfully. Awaiting admin approval.',
      bookstore: createdBookstore
    });

  } catch (error) {
    console.error('Register bookstore error:', error);
    res.status(500).json({
      error: 'Failed to register bookstore',
      message: 'Something went wrong while registering the bookstore'
    });
  }
});

// Test route - simple bookstore query without auth
router.get('/test-simple', async (req, res) => {
  try {
    console.log('TEST SIMPLE ROUTE HIT!');
    const bookstore = await Bookstore.findOne({
      where: { owner_id: 2 }
    });
    console.log('Bookstore found:', bookstore ? bookstore.name : 'Not found');
    res.json({ 
      success: true, 
      bookstore: bookstore ? { id: bookstore.id, name: bookstore.name } : null 
    });
  } catch (error) {
    console.error('Test simple error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/bookstores/my-bookstore
// @desc    Update current user's bookstore
// @access  Private (Bookstore owners only)
router.put('/my-bookstore', authenticateToken, requireBookstoreOwner, validate(bookstoreSchemas.update), async (req, res) => {
  try {
    await req.bookstore.update(req.body);

    const updatedBookstore = await Bookstore.findByPk(req.bookstore.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    res.json({
      message: 'Bookstore updated successfully',
      bookstore: updatedBookstore
    });

  } catch (error) {
    console.error('Update bookstore error:', error);
    res.status(500).json({
      error: 'Failed to update bookstore',
      message: 'Something went wrong while updating the bookstore'
    });
  }
});

// @route   POST /api/bookstores/my-bookstore/upload-logo
// @desc    Upload bookstore logo
// @access  Private (Bookstore owners only)
router.post('/my-bookstore/upload-logo', authenticateToken, requireBookstoreOwner, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No logo provided',
        message: 'Please select a logo to upload'
      });
    }

    // Delete old logo if exists
    if (req.bookstore.logo_url) {
      const oldLogoPath = path.join(__dirname, '..', req.bookstore.logo_url);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Update bookstore with new logo URL
    const logoUrl = `/uploads/bookstores/${req.file.filename}`;
    await req.bookstore.update({ logo_url: logoUrl });

    res.json({
      message: 'Logo uploaded successfully',
      logo_url: logoUrl
    });

  } catch (error) {
    console.error('Upload logo error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      error: 'Failed to upload logo',
      message: 'Something went wrong while uploading the logo'
    });
  }
});

// @route   GET /api/bookstores/my-bookstore/books
// @desc    Get current user's bookstore books
// @access  Private (Bookstore owners only)
router.get('/my-bookstore/books', authenticateToken, requireBookstoreOwner, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      is_active,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { bookstore_id: req.bookstore.id };

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { title_arabic: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { author_arabic: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Category filter
    if (category) {
      whereClause.category = { [Op.iLike]: `%${category}%` };
    }

    // Active status filter
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    // Sorting
    const validSortFields = ['created_at', 'title', 'price', 'stock_quantity'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: books } = await Book.findAndCountAll({
      where: whereClause,
      order: [[sortField, sortDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      books,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });

  } catch (error) {
    console.error('Get my bookstore books error:', error);
    res.status(500).json({
      error: 'Failed to fetch books',
      message: 'Something went wrong while fetching your books'
    });
  }
});

// Admin routes (for approving bookstores)
// @route   GET /api/bookstores/admin/pending
// @desc    Get pending bookstore approvals
// @access  Private (Admin only)
router.get('/admin/pending', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const pendingBookstores = await Bookstore.findAll({
      where: { is_approved: false },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'email', 'phone']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json({ bookstores: pendingBookstores });

  } catch (error) {
    console.error('Get pending bookstores error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending bookstores',
      message: 'Something went wrong while fetching pending bookstores'
    });
  }
});

// @route   PUT /api/bookstores/admin/:id/approve
// @desc    Approve a bookstore
// @access  Private (Admin only)
router.put('/admin/:id/approve', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const bookstore = await Bookstore.findByPk(req.params.id);

    if (!bookstore) {
      return res.status(404).json({
        error: 'Bookstore not found',
        message: 'The requested bookstore was not found'
      });
    }

    await bookstore.update({ is_approved: true });

    res.json({
      message: 'Bookstore approved successfully',
      bookstore
    });

  } catch (error) {
    console.error('Approve bookstore error:', error);
    res.status(500).json({
      error: 'Failed to approve bookstore',
      message: 'Something went wrong while approving the bookstore'
    });
  }
});

module.exports = router;
