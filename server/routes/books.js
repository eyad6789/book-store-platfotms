const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { Book, Bookstore, User, Category, BookReview, Wishlist, SearchQuery, LibraryBook } = require('../models');
const { authenticateToken, requireBookstoreOwner, optionalAuth } = require('../middleware/auth');
const { validate, bookSchemas } = require('../middleware/validation');
// const cacheService = require('../services/CacheService');
// const imageOptimizationService = require('../services/ImageOptimizationService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for memory storage (we'll process with Sharp)
const upload = multer({
  storage: multer.memoryStorage(),
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

// @route   GET /api/books/search
// @desc    Advanced search with intelligent filtering
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  const {
    q = '',           // Search query
    category,         // Category filter
    subcategory,      // Subcategory filter
    author,           // Author filter
    publisher,        // Publisher filter
    minPrice,         // Min price
    maxPrice,         // Max price
    language = '',    // Language filter
    condition,        // Book condition
    minYear,          // Min publication year
    maxYear,          // Max publication year
    minRating,        // Min rating
    tags,             // Tags filter
    sortBy = 'relevance', // Sort option
    page = 1,         // Pagination
    limit = 12,       // Items per page
    governorate       // Location filter
  } = req.query;
  
  let whereClause = { is_active: true };
  let orderClause = [];
  let includeClause = [
    { 
      model: Bookstore, 
      as: 'bookstore',
      attributes: ['id', 'name', 'name_arabic', 'governorate', 'rating'],
      where: { is_approved: true, is_active: true }
    },
    { 
      model: Category, 
      as: 'bookCategory',
      attributes: ['id', 'name', 'name_ar', 'name_ku'],
      required: false
    }
  ];
  
  try {
    // Check cache first for search results (temporarily disabled)
    // const cacheKey = `search:${q}:${JSON.stringify(req.query)}`;
    // const cachedResults = await cacheService.getCachedSearchResults(q, req.query);
    
    // if (cachedResults && !req.query.page) {
    //   console.log('Returning cached search results');
    //   return res.json(cachedResults);
    // }

    // Advanced search logic
    if (q.trim()) {
      const searchTerms = q.trim().split(' ').filter(term => term.length > 0);
      const searchConditions = searchTerms.map(term => ({
        [Op.or]: [
          { title: { [Op.iLike]: `%${term}%` } },
          { title_arabic: { [Op.iLike]: `%${term}%` } },
          { author: { [Op.iLike]: `%${term}%` } },
          { author_arabic: { [Op.iLike]: `%${term}%` } },
          { description: { [Op.iLike]: `%${term}%` } },
          { description_arabic: { [Op.iLike]: `%${term}%` } },
          { publisher: { [Op.iLike]: `%${term}%` } },
          { publisher_arabic: { [Op.iLike]: `%${term}%` } },
          { tags: { [Op.overlap]: [term] } }
        ]
      }));
      
      whereClause[Op.and] = searchConditions;
      
      // Log search query
      try {
        await SearchQuery.create({
          query: q,
          user_id: req.user?.id,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });
      } catch (logError) {
        console.error('Search logging error:', logError);
      }
    }
    
    // Apply filters
    if (category) whereClause.category_id = category;
    if (subcategory) whereClause.subcategory_id = subcategory;
    if (author) whereClause[Op.or] = [
      { author: { [Op.iLike]: `%${author}%` } },
      { author_arabic: { [Op.iLike]: `%${author}%` } }
    ];
    if (publisher) whereClause[Op.or] = [
      { publisher: { [Op.iLike]: `%${publisher}%` } },
      { publisher_arabic: { [Op.iLike]: `%${publisher}%` } }
    ];
    if (minPrice) whereClause.price = { [Op.gte]: parseFloat(minPrice) };
    if (maxPrice) whereClause.price = { ...whereClause.price, [Op.lte]: parseFloat(maxPrice) };
    if (language) whereClause.language = language;
    if (condition) whereClause.condition = condition;
    if (minYear) whereClause.publication_year = { [Op.gte]: parseInt(minYear) };
    if (maxYear) whereClause.publication_year = { ...whereClause.publication_year, [Op.lte]: parseInt(maxYear) };
    if (minRating) whereClause.rating = { [Op.gte]: parseFloat(minRating) };
    if (tags) whereClause.tags = { [Op.overlap]: tags.split(',') };
    if (governorate) {
      includeClause[0].where.governorate = governorate;
    }
    
    // Sorting options
    switch (sortBy) {
      case 'price_low':
        orderClause = [['price', 'ASC']];
        break;
      case 'price_high':
        orderClause = [['price', 'DESC']];
        break;
      case 'newest':
        orderClause = [['created_at', 'DESC']];
        break;
      case 'oldest':
        orderClause = [['created_at', 'ASC']];
        break;
      case 'rating':
        orderClause = [['rating', 'DESC'], ['total_reviews', 'DESC']];
        break;
      case 'popular':
        orderClause = [['view_count', 'DESC'], ['total_reviews', 'DESC']];
        break;
      case 'title_ar':
        orderClause = [['title_arabic', 'ASC']];
        break;
      case 'title_en':
        orderClause = [['title', 'ASC']];
        break;
      case 'author':
        orderClause = [['author', 'ASC']];
        break;
      case 'relevance':
      default:
        if (q.trim()) {
          orderClause = [
            ['view_count', 'DESC'],
            ['rating', 'DESC']
          ];
        } else {
          orderClause = [['created_at', 'DESC']];
        }
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // For now, just get regular books to fix the 500 error
    // We'll add library books integration after fixing the basic functionality
    const result = await Book.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });
    
    // Add empty sources for compatibility
    const sources = {
      regular_books: result.count,
      library_books: 0
    };
    
    // Update search analytics
    if (q.trim()) {
      try {
        await SearchQuery.update(
          { results_count: result.count },
          { 
            where: { 
              query: q, 
              created_at: { [Op.gte]: new Date(Date.now() - 60000) } 
            } 
          }
        );
      } catch (updateError) {
        console.error('Search analytics update error:', updateError);
      }
    }
    
    const totalPages = Math.ceil(result.count / parseInt(limit));
    
    const responseData = {
      success: true,
      books: result.rows,
      sources: sources,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: result.count,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        category,
        subcategory,
        author,
        publisher,
        minPrice,
        maxPrice,
        language,
        condition,
        minYear,
        maxYear,
        minRating,
        tags,
        governorate
      },
      sorting: sortBy
    };

    // Cache search results for first page only (temporarily disabled)
    // if (parseInt(page) === 1 && q.trim()) {
    //   await cacheService.cacheSearchResults(q, req.query, responseData, 1800); // 30 minutes
    // }

    res.json(responseData);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'حدث خطأ أثناء البحث',
      message: error.message 
    });
  }
});

// @route   GET /api/books
// @desc    Get all books including approved library books
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  console.log('🚀 Main books API called with query:', req.query);
  
  try {
    const { 
      page = 1, 
      limit = 12, 
      sort_by = 'created_at', 
      sort_order = 'DESC',
      include_library = 'true'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    if (include_library === 'false') {
      // Only regular books
      const result = await Book.findAndCountAll({
        where: { is_active: true },
        include: [
          { 
            model: Bookstore, 
            as: 'bookstore',
            attributes: ['id', 'name', 'name_arabic', 'governorate', 'rating'],
            where: { is_approved: true, is_active: true }
          }
        ],
        order: [[sort_by, sort_order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });
      
      const totalPages = Math.ceil(result.count / parseInt(limit));
      
      return res.json({
        success: true,
        books: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: result.count,
          itemsPerPage: parseInt(limit),
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      });
    }
    
    // Get regular books
    const regularBooksPromise = Book.findAndCountAll({
      where: { is_active: true },
      include: [
        { 
          model: Bookstore, 
          as: 'bookstore',
          attributes: ['id', 'name', 'name_arabic', 'governorate', 'rating'],
          where: { is_approved: true, is_active: true }
        }
      ],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });
    
    // Get library books if include_library is true
    let libraryBooksPromise = Promise.resolve({ count: 0, rows: [] });
    
    console.log('📚 Books API - include_library parameter:', include_library);
    
    if (include_library !== 'false' && include_library !== false) {
      console.log('🔍 Attempting to fetch library books directly...');
      
      // Try the most basic approach - just get the books without any complex queries
      try {
        const libraryBooksResult = await LibraryBook.findAll({
          where: { status: 'approved' },
          limit: 5 // Just get a few for testing
        });
        
        console.log('✅ Direct LibraryBook query succeeded:', libraryBooksResult.length, 'books found');
        
        libraryBooksPromise = Promise.resolve({
          count: libraryBooksResult.length,
          rows: libraryBooksResult
        });
      } catch (directError) {
        console.log('❌ Direct LibraryBook query failed:', directError.message);
        libraryBooksPromise = Promise.resolve({ count: 0, rows: [] });
      }
    } else {
      console.log('⏭️ Skipping library books (include_library=false)');
    }
    
    const [regularBooks, libraryBooks] = await Promise.all([regularBooksPromise, libraryBooksPromise]);
    
    console.log('📊 Results - Regular books:', regularBooks.count, 'Library books:', libraryBooks.count);
    
    // Combine results
    const combinedBooks = [
      ...regularBooks.rows,
      ...libraryBooks.rows.map(book => ({
        ...book.toJSON(),
        source: 'library',
        // Map library book fields to regular book structure
        title_arabic: book.title_ar || book.title,
        author_arabic: book.author_ar || book.author,
        description_arabic: book.description_ar || book.description,
        image_url: book.cover_image_url,
        category: book.category?.name_ar || book.category?.name
      }))
    ];
    
    const totalCount = regularBooks.count + libraryBooks.count;
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    console.log('✅ Combined books total:', combinedBooks.length, 'Sources:', {
      regular_books: regularBooks.count,
      library_books: libraryBooks.count
    });
    
    return res.json({
      success: true,
      books: combinedBooks.slice(0, parseInt(limit)),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.max(totalPages, Math.ceil(regularBooks.count / parseInt(limit))),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      sources: {
        regular_books: regularBooks.count,
        library_books: libraryBooks.count
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في جلب الكتب',
      message: error.message
    });
  }
});

// @route   GET /api/books/library
// @desc    Get approved library books (public access)
// @access  Public
router.get('/library', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      sort_by = 'created_at', 
      sort_order = 'DESC',
      search,
      category_id,
      bookstore_id
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = { status: 'approved' };
    
    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { title_ar: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { author_ar: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filter by category
    if (category_id) {
      whereClause.category_id = category_id;
    }
    
    // Filter by bookstore
    if (bookstore_id) {
      whereClause.bookstore_id = bookstore_id;
    }
    
    // Check if LibraryBook table exists and has data
    const libraryBooksCount = await LibraryBook.count({ where: { status: 'approved' } });
    
    if (libraryBooksCount === 0) {
      return res.json({
        success: true,
        books: [],
        message: 'لا توجد كتب مكتبات معتمدة حالياً',
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: parseInt(limit),
          hasNext: false,
          hasPrev: false
        }
      });
    }
    
    const result = await LibraryBook.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: Bookstore, 
          as: 'bookstore',
          attributes: ['id', 'name', 'name_arabic', 'governorate', 'phone', 'email'],
          where: { is_approved: true, is_active: true }
        },
        { 
          model: Category, 
          as: 'category',
          attributes: ['id', 'name', 'name_ar'],
          required: false
        }
      ],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });
    
    const totalPages = Math.ceil(result.count / parseInt(limit));
    
    res.json({
      success: true,
      books: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: result.count,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get library books error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في جلب كتب المكتبات',
      message: error.message
    });
  }
});

// @route   GET /api/books/library/:id
// @desc    Get single library book by ID (public access)
// @access  Public
router.get('/library/:id', optionalAuth, async (req, res) => {
  try {
    const book = await LibraryBook.findOne({
      where: {
        id: req.params.id,
        status: 'approved'
      },
      include: [
        {
          model: Bookstore,
          as: 'bookstore',
          attributes: ['id', 'name', 'name_arabic', 'description', 'description_arabic', 'phone', 'email', 'address', 'address_arabic'],
          where: { is_approved: true, is_active: true },
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'full_name']
            }
          ]
        },
        { 
          model: Category, 
          as: 'category',
          attributes: ['id', 'name', 'name_ar']
        }
      ]
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'الكتاب غير موجود',
        message: 'الكتاب المطلوب غير موجود أو غير معتمد'
      });
    }

    // Get related books from the same bookstore or category
    const relatedBooks = await LibraryBook.findAll({
      where: {
        id: { [Op.not]: book.id },
        status: 'approved',
        [Op.or]: [
          { bookstore_id: book.bookstore_id },
          { category_id: book.category_id }
        ]
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
      success: true,
      book,
      related_books: relatedBooks
    });

  } catch (error) {
    console.error('Get library book error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في جلب الكتاب',
      message: error.message
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

// @route   GET /api/books/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Get book title suggestions
    const bookSuggestions = await Book.findAll({
      attributes: ['title', 'title_arabic', 'author', 'author_arabic'],
      where: {
        is_active: true,
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { title_arabic: { [Op.iLike]: `%${q}%` } },
          { author: { [Op.iLike]: `%${q}%` } },
          { author_arabic: { [Op.iLike]: `%${q}%` } }
        ]
      },
      limit: 5,
      raw: true
    });

    // Get category suggestions
    const categorySuggestions = await Category.findAll({
      attributes: ['name', 'name_ar'],
      where: {
        is_active: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { name_ar: { [Op.iLike]: `%${q}%` } }
        ]
      },
      limit: 3,
      raw: true
    });

    const suggestions = [
      ...bookSuggestions.map(book => ({
        text: book.title_arabic || book.title,
        type: 'book'
      })),
      ...bookSuggestions.map(book => ({
        text: book.author_arabic || book.author,
        type: 'author'
      })).filter((item, index, self) => 
        index === self.findIndex(t => t.text === item.text)
      ),
      ...categorySuggestions.map(cat => ({
        text: cat.name_ar || cat.name,
        type: 'category'
      }))
    ].slice(0, 8);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// @route   GET /api/books/popular-searches
// @desc    Get popular search queries
// @access  Public
router.get('/popular-searches', async (req, res) => {
  try {
    const popularSearches = await SearchQuery.findAll({
      attributes: [
        'query',
        [fn('COUNT', col('query')), 'search_count'],
        [fn('AVG', col('results_count')), 'avg_results']
      ],
      where: {
        created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        query: { [Op.ne]: '' }
      },
      group: ['query'],
      order: [[literal('search_count'), 'DESC']],
      limit: 10,
      raw: true
    });
    
    res.json({ success: true, popularSearches });
  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/books/categories
// @desc    Get all book categories with hierarchy
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    // Check cache first (temporarily disabled)
    // const cachedCategories = await cacheService.getCachedCategories();
    // if (cachedCategories) {
    //   console.log('Returning cached categories');
    //   return res.json({ success: true, categories: cachedCategories });
    // }

    // Check if Category table exists, if not return empty array
    try {
      const categories = await Category.findAll({
        where: { is_active: true, parent_id: null },
        include: [{
          model: Category,
          as: 'subcategories',
          where: { is_active: true },
          required: false
        }],
        order: [['sort_order', 'ASC'], ['name_ar', 'ASC']]
      });

      // Cache categories for 2 hours (temporarily disabled)
      // await cacheService.cacheCategories(categories, 7200);

      res.json({ success: true, categories });
    } catch (dbError) {
      console.log('Categories table not found, returning empty array');
      res.json({ success: true, categories: [] });
    }
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
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
// @desc    Upload and optimize book image
// @access  Private (Bookstore owners only)
router.post('/:id/upload-image', authenticateToken, requireBookstoreOwner, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'لم يتم تحديد صورة',
        message: 'يرجى اختيار صورة للرفع'
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
        success: false,
        error: 'الكتاب غير موجود',
        message: 'الكتاب غير موجود أو ليس لديك صلاحية لتعديله'
      });
    }

    // Delete old optimized image if exists
    if (book.image_url && book.image_url.includes('/optimized/')) {
      const oldFilename = path.basename(book.image_url);
      await imageOptimizationService.deleteOptimizedImage(oldFilename);
    }

    // Optimize and save new image
    const optimizationResult = await imageOptimizationService.optimizeImage(
      req.file.buffer,
      req.file.originalname,
      {
        width: 600,
        height: 800,
        quality: 85,
        format: 'webp',
        generateThumbnail: true
      }
    );

    // Update book with new image URL
    await book.update({ 
      image_url: optimizationResult.url,
      images: [
        optimizationResult.url,
        ...(optimizationResult.thumbnail ? [optimizationResult.thumbnail.url] : [])
      ]
    });

    // Invalidate related caches
    await cacheService.invalidatePattern(`book:${book.id}*`);
    await cacheService.invalidatePattern(`bookstore:${req.bookstore.id}*`);

    res.json({
      success: true,
      message: 'تم رفع الصورة وتحسينها بنجاح',
      image_url: optimizationResult.url,
      thumbnail_url: optimizationResult.thumbnail?.url,
      optimization_stats: {
        original_size: req.file.size,
        optimized_size: optimizationResult.size,
        compression_ratio: Math.round((1 - optimizationResult.size / req.file.size) * 100),
        format: optimizationResult.format,
        dimensions: optimizationResult.dimensions
      }
    });

  } catch (error) {
    console.error('Upload image error:', error);
    
    res.status(500).json({
      success: false,
      error: 'فشل في رفع الصورة',
      message: error.message || 'حدث خطأ أثناء رفع الصورة'
    });
  }
});

// @route   POST /api/books/:id/wishlist
// @desc    Add/Remove book from wishlist
// @access  Private
router.post('/:id/wishlist', authenticateToken, async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;

    // Check if book exists
    const book = await Book.findOne({
      where: { id: bookId, is_active: true }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'الكتاب غير موجود'
      });
    }

    // Check if already in wishlist
    const existingWishlist = await Wishlist.findOne({
      where: { user_id: userId, book_id: bookId }
    });

    if (existingWishlist) {
      // Remove from wishlist
      await existingWishlist.destroy();
      res.json({
        success: true,
        message: 'تم إزالة الكتاب من قائمة الأمنيات',
        wishlisted: false
      });
    } else {
      // Add to wishlist
      await Wishlist.create({
        user_id: userId,
        book_id: bookId
      });
      res.json({
        success: true,
        message: 'تم إضافة الكتاب إلى قائمة الأمنيات',
        wishlisted: true
      });
    }
  } catch (error) {
    console.error('Wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في إدارة قائمة الأمنيات'
    });
  }
});

// @route   GET /api/books/:id/reviews
// @desc    Get book reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await BookReview.findAndCountAll({
      where: { book_id: req.params.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(reviews.count / limit);

    res.json({
      success: true,
      reviews: reviews.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: reviews.count,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في جلب التقييمات'
    });
  }
});

// @route   POST /api/books/:id/reviews
// @desc    Add book review
// @access  Private
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { rating, review_title, review_text } = req.body;
    const bookId = req.params.id;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'التقييم يجب أن يكون بين 1 و 5 نجوم'
      });
    }

    // Check if book exists
    const book = await Book.findOne({
      where: { id: bookId, is_active: true }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'الكتاب غير موجود'
      });
    }

    // Check if user already reviewed this book
    const existingReview = await BookReview.findOne({
      where: { user_id: userId, book_id: bookId }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'لقد قمت بتقييم هذا الكتاب مسبقاً'
      });
    }

    // Create review
    const review = await BookReview.create({
      book_id: bookId,
      user_id: userId,
      rating: parseInt(rating),
      review_title,
      review_text
    });

    // Update book rating and review count
    const allReviews = await BookReview.findAll({
      where: { book_id: bookId },
      attributes: ['rating']
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await book.update({
      rating: Math.round(avgRating * 100) / 100,
      total_reviews: allReviews.length
    });

    // Get the created review with user info
    const createdReview = await BookReview.findByPk(review.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'تم إضافة التقييم بنجاح',
      review: createdReview
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في إضافة التقييم'
    });
  }
});

module.exports = router;
