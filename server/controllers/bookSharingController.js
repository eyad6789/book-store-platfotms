const { Op } = require('sequelize');
const { LibraryBook, BookShare, Bookstore, UserActivity } = require('../models');

// Helper function to track activity
const trackActivity = async (activityData) => {
  try {
    await UserActivity.track(activityData);
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
};

// @route   POST /api/library/books/:bookId/share
// @desc    Share a book (promotional feature)
// @access  Private (Bookstore owners only)
const shareBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;
    const { shareType = 'public', shareMessage, shareDurationDays = 30 } = req.body;
    
    // Verify book ownership and status
    const book = await LibraryBook.findOne({
      where: { id: bookId, status: 'approved' },
      include: [{ 
        model: Bookstore, 
        as: 'bookstore',
        where: { owner_id: userId }
      }]
    });
    
    if (!book) {
      return res.status(404).json({ 
        error: 'الكتاب غير موجود أو غير معتمد',
        message: 'لا يمكن مشاركة الكتب غير المعتمدة'
      });
    }
    
    // Check if book is already shared and active
    const existingShare = await BookShare.findOne({
      where: {
        library_book_id: bookId,
        is_active: true,
        expires_at: { [Op.gt]: new Date() }
      }
    });
    
    if (existingShare) {
      return res.status(400).json({
        error: 'الكتاب مشارك بالفعل',
        message: 'يوجد مشاركة نشطة لهذا الكتاب'
      });
    }
    
    // Create new share
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(shareDurationDays));
    
    const share = await BookShare.create({
      library_book_id: bookId,
      shared_by: userId,
      share_type: shareType,
      share_message: shareMessage,
      share_duration_days: parseInt(shareDurationDays),
      expires_at: expiresAt
    });
    
    // Update book sharing status
    await book.update({
      is_shared: true,
      shared_at: new Date()
    });
    
    // Track activity
    await trackActivity({
      user_id: userId,
      activity_type: 'share',
      entity_type: 'book',
      entity_id: bookId,
      metadata: {
        bookstore_id: book.bookstore_id,
        share_type: shareType,
        duration_days: shareDurationDays,
        title: book.title_ar || book.title
      }
    });
    
    res.json({
      success: true,
      message: 'تم مشاركة الكتاب بنجاح',
      share: {
        id: share.id,
        share_type: share.share_type,
        expires_at: share.expires_at,
        share_message: share.share_message
      }
    });
  } catch (error) {
    console.error('Error sharing book:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء مشاركة الكتاب'
    });
  }
};

// @route   GET /api/library/:bookstoreId/shared-books
// @desc    Get shared books for a bookstore
// @access  Private (Bookstore owners only)
const getSharedBooks = async (req, res) => {
  try {
    const { bookstoreId } = req.params;
    const { page = 1, limit = 20, status = 'active' } = req.query;
    const userId = req.user.id;
    
    // Verify ownership
    const bookstore = await Bookstore.findOne({
      where: { id: bookstoreId, owner_id: userId }
    });
    
    if (!bookstore) {
      return res.status(403).json({ 
        error: 'غير مصرح بالوصول'
      });
    }
    
    const whereClause = {
      shared_by: userId
    };
    
    // Filter by status
    if (status === 'active') {
      whereClause.is_active = true;
      whereClause.expires_at = { [Op.gt]: new Date() };
    } else if (status === 'expired') {
      whereClause[Op.or] = [
        { is_active: false },
        { expires_at: { [Op.lte]: new Date() } }
      ];
    }
    
    const shares = await BookShare.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: LibraryBook,
          as: 'book',
          where: { bookstore_id: bookstoreId },
          attributes: [
            'id', 'title_ar', 'author_ar', 'price', 
            'cover_image_url', 'views_count', 'sales_count'
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });
    
    res.json({
      success: true,
      shares: shares.rows.map(share => ({
        id: share.id,
        share_type: share.share_type,
        share_message: share.share_message,
        views_count: share.views_count,
        clicks_count: share.clicks_count,
        conversions_count: share.conversions_count,
        created_at: share.created_at,
        expires_at: share.expires_at,
        is_active: share.is_active,
        book: share.book
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(shares.count / limit),
        totalItems: shares.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shared books:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب الكتب المشاركة'
    });
  }
};

// @route   PUT /api/library/shares/:shareId
// @desc    Update book share
// @access  Private (Bookstore owners only)
const updateBookShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.id;
    const { shareMessage, shareDurationDays, isActive } = req.body;
    
    const share = await BookShare.findOne({
      where: { id: shareId, shared_by: userId }
    });
    
    if (!share) {
      return res.status(404).json({ 
        error: 'المشاركة غير موجودة'
      });
    }
    
    const updates = {};
    
    if (shareMessage !== undefined) {
      updates.share_message = shareMessage;
    }
    
    if (shareDurationDays !== undefined) {
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + parseInt(shareDurationDays));
      updates.expires_at = newExpiresAt;
      updates.share_duration_days = parseInt(shareDurationDays);
    }
    
    if (isActive !== undefined) {
      updates.is_active = isActive;
    }
    
    await share.update(updates);
    
    // Track activity
    await trackActivity({
      user_id: userId,
      activity_type: 'update_share',
      entity_type: 'book',
      entity_id: share.library_book_id,
      metadata: {
        share_id: shareId,
        updates: Object.keys(updates)
      }
    });
    
    res.json({
      success: true,
      message: 'تم تحديث المشاركة بنجاح',
      share
    });
  } catch (error) {
    console.error('Error updating book share:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء تحديث المشاركة'
    });
  }
};

// @route   DELETE /api/library/shares/:shareId
// @desc    Delete/deactivate book share
// @access  Private (Bookstore owners only)
const deleteBookShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const userId = req.user.id;
    
    const share = await BookShare.findOne({
      where: { id: shareId, shared_by: userId },
      include: [
        {
          model: LibraryBook,
          as: 'book',
          attributes: ['id', 'title_ar']
        }
      ]
    });
    
    if (!share) {
      return res.status(404).json({ 
        error: 'المشاركة غير موجودة'
      });
    }
    
    // Deactivate instead of delete to preserve analytics
    await share.update({ is_active: false });
    
    // Update book sharing status if no other active shares
    const otherActiveShares = await BookShare.count({
      where: {
        library_book_id: share.library_book_id,
        is_active: true,
        expires_at: { [Op.gt]: new Date() },
        id: { [Op.ne]: shareId }
      }
    });
    
    if (otherActiveShares === 0) {
      await LibraryBook.update(
        { is_shared: false },
        { where: { id: share.library_book_id } }
      );
    }
    
    // Track activity
    await trackActivity({
      user_id: userId,
      activity_type: 'delete_share',
      entity_type: 'book',
      entity_id: share.library_book_id,
      metadata: {
        share_id: shareId,
        title: share.book?.title_ar
      }
    });
    
    res.json({
      success: true,
      message: 'تم إلغاء المشاركة بنجاح'
    });
  } catch (error) {
    console.error('Error deleting book share:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء إلغاء المشاركة'
    });
  }
};

// @route   POST /api/library/shares/:shareId/track-view
// @desc    Track share view (public endpoint)
// @access  Public
const trackShareView = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { ip, userAgent } = req.body;
    
    const share = await BookShare.findOne({
      where: { 
        id: shareId, 
        is_active: true,
        expires_at: { [Op.gt]: new Date() }
      }
    });
    
    if (!share) {
      return res.status(404).json({ 
        error: 'المشاركة غير موجودة أو منتهية الصلاحية'
      });
    }
    
    // Increment view count
    await share.increment('views_count');
    
    // Track activity
    await trackActivity({
      user_id: req.user?.id || null,
      activity_type: 'view',
      entity_type: 'book',
      entity_id: share.library_book_id,
      metadata: {
        share_id: shareId,
        share_type: share.share_type,
        source: 'shared_link'
      },
      ip_address: ip,
      user_agent: userAgent
    });
    
    res.json({
      success: true,
      message: 'تم تسجيل المشاهدة'
    });
  } catch (error) {
    console.error('Error tracking share view:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء تسجيل المشاهدة'
    });
  }
};

// @route   POST /api/library/shares/:shareId/track-click
// @desc    Track share click (public endpoint)
// @access  Public
const trackShareClick = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { ip, userAgent } = req.body;
    
    const share = await BookShare.findOne({
      where: { 
        id: shareId, 
        is_active: true,
        expires_at: { [Op.gt]: new Date() }
      }
    });
    
    if (!share) {
      return res.status(404).json({ 
        error: 'المشاركة غير موجودة أو منتهية الصلاحية'
      });
    }
    
    // Increment click count
    await share.increment('clicks_count');
    
    // Track activity
    await trackActivity({
      user_id: req.user?.id || null,
      activity_type: 'click',
      entity_type: 'book',
      entity_id: share.library_book_id,
      metadata: {
        share_id: shareId,
        share_type: share.share_type,
        source: 'shared_link'
      },
      ip_address: ip,
      user_agent: userAgent
    });
    
    res.json({
      success: true,
      message: 'تم تسجيل النقرة'
    });
  } catch (error) {
    console.error('Error tracking share click:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء تسجيل النقرة'
    });
  }
};

module.exports = {
  shareBook,
  getSharedBooks,
  updateBookShare,
  deleteBookShare,
  trackShareView,
  trackShareClick
};
