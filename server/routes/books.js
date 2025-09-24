const express = require('express');
const { Op } = require('sequelize');
const { Book, Bookstore, User } = require('../models');
const { authenticateToken, requireBookstoreOwner, optionalAuth } = require('../middleware/auth');
const { validate, bookSchemas } = require('../middleware/validation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'books');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
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

// @route   GET /api/books
// @desc    Get all books with search and filtering
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      language,
      min_price,
      max_price,
      sort_by = 'created_at',
      sort_order = 'DESC',
      featured_only
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { is_active: true };

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { title_arabic: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { author_arabic: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { description_arabic: { [Op.iLike]: `%${search}%` } }
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

    // Language filter
    if (language) {
      whereClause.language = language;
    }

    // Price range filter
    if (min_price || max_price) {
      whereClause.price = {};
      if (min_price) whereClause.price[Op.gte] = parseFloat(min_price);
      if (max_price) whereClause.price[Op.lte] = parseFloat(max_price);
    }

    // Featured only filter
    if (featured_only === 'true') {
      whereClause.is_featured = true;
    }

    // Sorting
    const validSortFields = ['created_at', 'title', 'price', 'rating', 'total_sales'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: books } = await Book.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Bookstore,
          as: 'bookstore',
          attributes: ['id', 'name', 'name_arabic', 'is_approved'],
          where: { is_approved: true, is_active: true },
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'full_name']
            }
          ]
        }
      ],
      order: [[sortField, sortDirection]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
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
    console.error('Get books error:', error);
    res.status(500).json({
      error: 'Failed to fetch books',
      message: 'Something went wrong while fetching books'
    });
  }
});

// @route   GET /api/books/featured
// @desc    Get featured books
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const books = await Book.findAll({
      where: {
        is_active: true,
        is_featured: true
      },
      include: [
        {
          model: Bookstore,
          as: 'bookstore',
          attributes: ['id', 'name', 'name_arabic'],
          where: { is_approved: true, is_active: true }
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ books });

  } catch (error) {
    console.error('Get featured books error:', error);
    res.status(500).json({
      error: 'Failed to fetch featured books',
      message: 'Something went wrong while fetching featured books'
    });
  }
});

// @route   GET /api/books/categories
// @desc    Get all book categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Book.findAll({
      attributes: ['category', 'category_arabic'],
      where: {
        is_active: true,
        category: { [Op.not]: null }
      },
      group: ['category', 'category_arabic'],
      raw: true
    });

    const uniqueCategories = categories
      .filter(cat => cat.category)
      .map(cat => ({
        english: cat.category,
        arabic: cat.category_arabic || cat.category
      }));

    res.json({ categories: uniqueCategories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: 'Something went wrong while fetching categories'
    });
  }
});

// @route   GET /api/books/:id
// @desc    Get single book by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const book = await Book.findOne({
      where: {
        id: req.params.id,
        is_active: true
      },
      include: [
        {
          model: Bookstore,
          as: 'bookstore',
          attributes: ['id', 'name', 'name_arabic', 'description', 'description_arabic', 'phone', 'email'],
          where: { is_approved: true, is_active: true },
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'full_name']
            }
          ]
        }
      ]
    });

    if (!book) {
      return res.status(404).json({
        error: 'Book not found',
        message: 'The requested book was not found'
      });
    }

    // Get related books from the same category
    const relatedBooks = await Book.findAll({
      where: {
        id: { [Op.not]: book.id },
        category: book.category,
        is_active: true
      },
      include: [
        {
          model: Bookstore,
          as: 'bookstore',
          attributes: ['id', 'name', 'name_arabic'],
          where: { is_approved: true, is_active: true }
        }
      ],
      limit: 4,
      order: [['created_at', 'DESC']]
    });

    res.json({
      book,
      related_books: relatedBooks
    });

  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      error: 'Failed to fetch book',
      message: 'Something went wrong while fetching the book'
    });
  }
});

// @route   POST /api/books
// @desc    Create a new book
// @access  Private (Bookstore owners only)
router.post('/', authenticateToken, requireBookstoreOwner, validate(bookSchemas.create), async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      bookstore_id: req.bookstore.id
    };

    const book = await Book.create(bookData);

    const createdBook = await Book.findByPk(book.id, {
      include: [
        {
          model: Bookstore,
          as: 'bookstore',
          attributes: ['id', 'name', 'name_arabic']
        }
      ]
    });

    res.status(201).json({
      message: 'Book created successfully',
      book: createdBook
    });

  } catch (error) {
    console.error('Create book error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Duplicate ISBN',
        message: 'A book with this ISBN already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to create book',
      message: 'Something went wrong while creating the book'
    });
  }
});

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private (Bookstore owners only)
router.put('/:id', authenticateToken, requireBookstoreOwner, validate(bookSchemas.update), async (req, res) => {
  try {
    const book = await Book.findOne({
      where: {
        id: req.params.id,
        bookstore_id: req.bookstore.id
      }
    });

    if (!book) {
      return res.status(404).json({
        error: 'Book not found',
        message: 'Book not found or you do not have permission to edit it'
      });
    }

    await book.update(req.body);

    const updatedBook = await Book.findByPk(book.id, {
      include: [
        {
          model: Bookstore,
          as: 'bookstore',
          attributes: ['id', 'name', 'name_arabic']
        }
      ]
    });

    res.json({
      message: 'Book updated successfully',
      book: updatedBook
    });

  } catch (error) {
    console.error('Update book error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Duplicate ISBN',
        message: 'A book with this ISBN already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to update book',
      message: 'Something went wrong while updating the book'
    });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book (soft delete by setting is_active to false)
// @access  Private (Bookstore owners only)
router.delete('/:id', authenticateToken, requireBookstoreOwner, async (req, res) => {
  try {
    const book = await Book.findOne({
      where: {
        id: req.params.id,
        bookstore_id: req.bookstore.id
      }
    });

    if (!book) {
      return res.status(404).json({
        error: 'Book not found',
        message: 'Book not found or you do not have permission to delete it'
      });
    }

    // Soft delete by setting is_active to false
    await book.update({ is_active: false });

    res.json({
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      error: 'Failed to delete book',
      message: 'Something went wrong while deleting the book'
    });
  }
});

// @route   POST /api/books/:id/upload-image
// @desc    Upload book image
// @access  Private (Bookstore owners only)
router.post('/:id/upload-image', authenticateToken, requireBookstoreOwner, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please select an image to upload'
      });
    }

    const book = await Book.findOne({
      where: {
        id: req.params.id,
        bookstore_id: req.bookstore.id
      }
    });

    if (!book) {
      return res.status(404).json({
        error: 'Book not found',
        message: 'Book not found or you do not have permission to edit it'
      });
    }

    // Delete old image if exists
    if (book.image_url) {
      const oldImagePath = path.join(__dirname, '..', book.image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update book with new image URL
    const imageUrl = `/uploads/books/${req.file.filename}`;
    await book.update({ image_url: imageUrl });

    res.json({
      message: 'Image uploaded successfully',
      image_url: imageUrl
    });

  } catch (error) {
    console.error('Upload image error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      error: 'Failed to upload image',
      message: 'Something went wrong while uploading the image'
    });
  }
});

module.exports = router;
