const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { LibraryBook, Bookstore, Category, BookShare, User, UserActivity } = require('../models');

// Configure multer for book cover uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'library-books');
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
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('فقط الصور مسموح بها'));
    }
  }
});

// Helper function to track activity
const trackActivity = async (activityData) => {
  try {
    await UserActivity.track(activityData);
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
};

// @route   POST /api/library/:bookstoreId/books
// @desc    Add new library book
// @access  Private (Bookstore owners only)
const addLibraryBook = async (req, res) => {
  try {
    const { bookstoreId } = req.params;
    const userId = req.user.id;
    
    // Verify ownership
    const bookstore = await Bookstore.findOne({
      where: { id: bookstoreId, owner_id: userId }
    });
    
    if (!bookstore) {
      return res.status(403).json({ 
        error: 'غير مصرح بالوصول',
        message: 'ليس لديك صلاحية لإضافة كتب لهذه المكتبة'
      });
    }
    
    const {
      title, title_ar, author, author_ar, isbn,
      description, description_ar, category_id,
      publisher, publication_year, language,
      page_count, price, stock_quantity, condition
    } = req.body;
    
    // Check for duplicate ISBN
    if (isbn) {
      const existingBook = await LibraryBook.findOne({ where: { isbn } });
      if (existingBook) {
        return res.status(400).json({ 
          error: 'رقم ISBN موجود مسبقاً',
          message: 'يوجد كتاب آخر بنفس رقم ISBN'
        });
      }
    }
    
    const coverImageUrl = req.file ? `/uploads/library-books/${req.file.filename}` : null;
    
    const book = await LibraryBook.create({
      bookstore_id: bookstoreId,
      title, title_ar, author, author_ar, isbn,
      description, description_ar, category_id,
      publisher, publication_year, language,
      page_count, price, stock_quantity, condition,
      cover_image_url: coverImageUrl,
      status: 'pending' // Requires admin approval
    });
    
    // Track activity
    await trackActivity({
      user_id: userId,
      activity_type: 'add_book',
      entity_type: 'book',
      entity_id: book.id,
      metadata: { 
        bookstore_id: bookstoreId, 
        title: title_ar || title,
        action: 'create'
      }
    });
    
    // Fetch the created book with associations
    const createdBook = await LibraryBook.findByPk(book.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'name_ar'] },
        { model: Bookstore, as: 'bookstore', attributes: ['id', 'name', 'name_arabic'] }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'تم إضافة الكتاب بنجاح. في انتظار موافقة الإدارة.',
      book: createdBook
    });
  } catch (error) {
    console.error('Error adding library book:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ 
      error: 'حدث خطأ أثناء إضافة الكتاب',
      message: 'يرجى المحاولة مرة أخرى'
    });
  }
};

// @route   GET /api/library/:bookstoreId/books
// @desc    Get library books
// @access  Private (Bookstore owners only)
const getLibraryBooks = async (req, res) => {
  try {
    const { bookstoreId } = req.params;
    const { 
      status, 
      page = 1, 
      limit = 20, 
      sortBy = 'created_at',
      sortOrder = 'DESC',
      search,
      category_id
    } = req.query;
    
    // Verify ownership
    const bookstore = await Bookstore.findOne({
      where: { id: bookstoreId, owner_id: req.user.id }
    });
    
    if (!bookstore) {
      return res.status(403).json({ 
        error: 'غير مصرح بالوصول'
      });
    }
    
    const whereClause = { bookstore_id: bookstoreId };
    
    // Filter by status
    if (status) {
      whereClause.status = status;
    }
    
    // Filter by category
    if (category_id) {
      whereClause.category_id = category_id;
    }
    
    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { title_ar: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { author_ar: { [Op.iLike]: `%${search}%` } },
        { isbn: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const validSortFields = ['created_at', 'title_ar', 'price', 'views_count', 'sales_count', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    const books = await LibraryBook.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [[sortField, sortDirection]],
      include: [
        { 
          model: Category, 
          as: 'category', 
          attributes: ['id', 'name', 'name_ar'] 
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name']
        }
      ]
    });
    
    res.json({
      success: true,
      books: books.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(books.count / limit),
        totalItems: books.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching library books:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب الكتب'
    });
  }
};

// @route   GET /api/library/books/:bookId
// @desc    Get single library book
// @access  Private (Bookstore owners only)
const getLibraryBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await LibraryBook.findOne({
      where: { id: bookId },
      include: [
        { 
          model: Bookstore, 
          as: 'bookstore',
          where: { owner_id: req.user.id },
          attributes: ['id', 'name', 'name_arabic']
        },
        { 
          model: Category, 
          as: 'category', 
          attributes: ['id', 'name', 'name_ar'] 
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name']
        },
        {
          model: BookShare,
          as: 'shares',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'share_type', 'views_count', 'clicks_count', 'conversions_count']
        }
      ]
    });
    
    if (!book) {
      return res.status(404).json({ 
        error: 'الكتاب غير موجود'
      });
    }
    
    res.json({
      success: true,
      book
    });
  } catch (error) {
    console.error('Error fetching library book:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب الكتاب'
    });
  }
};

// @route   PUT /api/library/books/:bookId
// @desc    Update library book
// @access  Private (Bookstore owners only)
const updateLibraryBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;
    
    const book = await LibraryBook.findOne({
      where: { id: bookId },
      include: [{ 
        model: Bookstore, 
        as: 'bookstore',
        where: { owner_id: userId }
      }]
    });
    
    if (!book) {
      return res.status(404).json({ 
        error: 'الكتاب غير موجود'
      });
    }
    
    const updates = { ...req.body };
    
    // Handle new cover image
    if (req.file) {
      // Delete old image if exists
      if (book.cover_image_url) {
        const oldImagePath = path.join(__dirname, '..', book.cover_image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updates.cover_image_url = `/uploads/library-books/${req.file.filename}`;
    }
    
    // If book was approved and is being edited, reset to pending
    if (book.status === 'approved' && Object.keys(updates).some(key => 
      !['views_count', 'sales_count'].includes(key)
    )) {
      updates.status = 'pending';
      updates.approved_by = null;
      updates.approved_at = null;
    }
    
    await book.update(updates);
    
    // Track activity
    await trackActivity({
      user_id: userId,
      activity_type: 'update_book',
      entity_type: 'book',
      entity_id: book.id,
      metadata: { 
        bookstore_id: book.bookstore_id,
        title: book.title_ar || book.title,
        action: 'update',
        fields_updated: Object.keys(updates)
      }
    });
    
    // Fetch updated book with associations
    const updatedBook = await LibraryBook.findByPk(book.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'name_ar'] },
        { model: Bookstore, as: 'bookstore', attributes: ['id', 'name', 'name_arabic'] }
      ]
    });
    
    res.json({
      success: true,
      message: 'تم تحديث الكتاب بنجاح',
      book: updatedBook
    });
  } catch (error) {
    console.error('Error updating library book:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.status(500).json({ 
      error: 'حدث خطأ أثناء تحديث الكتاب'
    });
  }
};

// @route   DELETE /api/library/books/:bookId
// @desc    Delete library book
// @access  Private (Bookstore owners only)
const deleteLibraryBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;
    
    const book = await LibraryBook.findOne({
      where: { id: bookId },
      include: [{ 
        model: Bookstore, 
        as: 'bookstore',
        where: { owner_id: userId }
      }]
    });
    
    if (!book) {
      return res.status(404).json({ 
        error: 'الكتاب غير موجود'
      });
    }
    
    // Check if book has sales
    if (book.sales_count > 0) {
      // Soft delete - mark as inactive
      await book.update({ status: 'inactive' });
      
      await trackActivity({
        user_id: userId,
        activity_type: 'deactivate_book',
        entity_type: 'book',
        entity_id: book.id,
        metadata: { 
          bookstore_id: book.bookstore_id,
          title: book.title_ar || book.title,
          action: 'soft_delete'
        }
      });
      
      return res.json({ 
        success: true,
        message: 'تم تعطيل الكتاب بنجاح (لا يمكن حذف الكتب التي تم بيعها)'
      });
    }
    
    // Delete cover image if exists
    if (book.cover_image_url) {
      const imagePath = path.join(__dirname, '..', book.cover_image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await trackActivity({
      user_id: userId,
      activity_type: 'delete_book',
      entity_type: 'book',
      entity_id: book.id,
      metadata: { 
        bookstore_id: book.bookstore_id,
        title: book.title_ar || book.title,
        action: 'hard_delete'
      }
    });
    
    await book.destroy();
    
    res.json({ 
      success: true,
      message: 'تم حذف الكتاب بنجاح'
    });
  } catch (error) {
    console.error('Error deleting library book:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء حذف الكتاب'
    });
  }
};

module.exports = {
  addLibraryBook,
  getLibraryBooks,
  getLibraryBook,
  updateLibraryBook,
  deleteLibraryBook,
  upload
};
