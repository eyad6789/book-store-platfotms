const express = require('express');
const { Op, fn, col, literal, QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Book, Bookstore, User, Order, OrderItem, BookReview, SearchQuery } = require('../models');
const { authenticateToken, requireBookstoreOwner } = require('../middleware/auth');

const router = express.Router();

// Analytics Service Class
class AnalyticsService {
  static async getBookstoreAnalytics(bookstoreId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const [
      salesData,
      ordersData,
      topBooks,
      recentOrders,
      customerAnalytics,
      reviewsData
    ] = await Promise.all([
      this.getSalesAnalytics(bookstoreId, startDate),
      this.getOrdersAnalytics(bookstoreId, startDate),
      this.getTopBooks(bookstoreId, days),
      this.getRecentOrders(bookstoreId, 10),
      this.getCustomerAnalytics(bookstoreId, startDate),
      this.getReviewsAnalytics(bookstoreId, startDate)
    ]);
    
    return {
      period: { days, startDate, endDate: new Date() },
      sales: salesData,
      orders: ordersData,
      topBooks,
      recentOrders,
      customers: customerAnalytics,
      reviews: reviewsData
    };
  }
  
  static async getSalesAnalytics(bookstoreId, startDate) {
    const result = await sequelize.query(`
      SELECT 
        DATE(o.created_at) as date,
        SUM(oi.quantity * oi.price) as revenue,
        COUNT(DISTINCT o.id) as orders_count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN books b ON oi.book_id = b.id
      WHERE b.bookstore_id = :bookstoreId
        AND o.status = 'completed'
        AND o.created_at >= :startDate
      GROUP BY DATE(o.created_at)
      ORDER BY DATE(o.created_at) ASC
    `, {
      replacements: { bookstoreId, startDate },
      type: QueryTypes.SELECT
    });
    
    const totalRevenue = result.reduce((sum, day) => sum + parseFloat(day.revenue || 0), 0);
    const totalOrders = result.reduce((sum, day) => sum + parseInt(day.orders_count || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      dailyData: result.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue || 0),
        orders: parseInt(row.orders_count || 0)
      }))
    };
  }
  
  static async getTopBooks(bookstoreId, days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const result = await sequelize.query(`
      SELECT 
        b.id,
        b.title,
        b.title_arabic,
        b.author,
        b.author_arabic,
        b.price,
        b.image_url,
        b.rating,
        b.total_reviews,
        SUM(oi.quantity) as sold_quantity,
        SUM(oi.quantity * oi.price) as revenue
      FROM books b
      JOIN order_items oi ON b.id = oi.book_id
      JOIN orders o ON oi.order_id = o.id
      WHERE b.bookstore_id = :bookstoreId
        AND o.status = 'completed'
        AND o.created_at >= :startDate
      GROUP BY b.id, b.title, b.title_arabic, b.author, b.author_arabic, b.price, b.image_url, b.rating, b.total_reviews
      ORDER BY sold_quantity DESC
      LIMIT 10
    `, {
      replacements: { bookstoreId, startDate },
      type: QueryTypes.SELECT
    });
    
    return result;
  }
  
  static async getRecentOrders(bookstoreId, limit) {
    const result = await sequelize.query(`
      SELECT DISTINCT
        o.id,
        o.total_amount,
        o.status,
        o.created_at,
        u.full_name as customer_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN books b ON oi.book_id = b.id
      JOIN users u ON o.customer_id = u.id
      WHERE b.bookstore_id = :bookstoreId
      ORDER BY o.created_at DESC
      LIMIT :limit
    `, {
      replacements: { bookstoreId, limit },
      type: QueryTypes.SELECT
    });
    
    return result;
  }
  
  static async getCustomerAnalytics(bookstoreId, startDate) {
    const newCustomers = await sequelize.query(`
      SELECT COUNT(DISTINCT o.customer_id) as count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN books b ON oi.book_id = b.id
      WHERE b.bookstore_id = :bookstoreId
        AND o.created_at >= :startDate
    `, {
      replacements: { bookstoreId, startDate },
      type: QueryTypes.SELECT
    });
    
    const returningCustomers = await sequelize.query(`
      SELECT COUNT(DISTINCT o1.customer_id) as count
      FROM orders o1
      JOIN order_items oi1 ON o1.id = oi1.order_id
      JOIN books b1 ON oi1.book_id = b1.id
      WHERE b1.bookstore_id = :bookstoreId
        AND o1.created_at >= :startDate
        AND EXISTS (
          SELECT 1 FROM orders o2 
          JOIN order_items oi2 ON o2.id = oi2.order_id
          JOIN books b2 ON oi2.book_id = b2.id
          WHERE o2.customer_id = o1.customer_id 
            AND b2.bookstore_id = :bookstoreId
            AND o2.created_at < o1.created_at
        )
    `, {
      replacements: { bookstoreId, startDate },
      type: QueryTypes.SELECT
    });
    
    return {
      newCustomers: newCustomers[0].count,
      returningCustomers: returningCustomers[0].count
    };
  }
  
  static async getReviewsAnalytics(bookstoreId, startDate) {
    const result = await sequelize.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN created_at >= :startDate THEN 1 END) as new_reviews
      FROM book_reviews br
      JOIN books b ON br.book_id = b.id
      WHERE b.bookstore_id = :bookstoreId
    `, {
      replacements: { bookstoreId, startDate },
      type: QueryTypes.SELECT
    });
    
    return result[0];
  }
}

// @route   GET /api/analytics/bookstore
// @desc    Get current user's bookstore analytics
// @access  Private (Bookstore owners only)
router.get('/bookstore', authenticateToken, requireBookstoreOwner, async (req, res) => {
  try {
    const bookstoreId = req.bookstore.id;
    const { days = 30 } = req.query;

    const analytics = await AnalyticsService.getBookstoreAnalytics(bookstoreId, parseInt(days));

    res.json({
      success: true,
      analytics,
      bookstore: {
        id: req.bookstore.id,
        name: req.bookstore.name,
        name_arabic: req.bookstore.name_arabic
      }
    });
  } catch (error) {
    console.error('Bookstore analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب تحليلات المكتبة',
      message: error.message
    });
  }
});

// @route   GET /api/analytics/bookstore/:bookstoreId
// @desc    Get comprehensive bookstore analytics by ID
// @access  Private (Bookstore owners only)
router.get('/bookstore/:bookstoreId', authenticateToken, requireBookstoreOwner, async (req, res) => {
  try {
    const { bookstoreId } = req.params;
    const { days = 30 } = req.query;
    
    // Verify bookstore ownership
    const bookstore = await Bookstore.findOne({
      where: { id: bookstoreId, owner_id: req.user.id }
    });
    
    if (!bookstore) {
      return res.status(403).json({ 
        success: false,
        error: 'غير مخول للوصول' 
      });
    }
    
    const analytics = await AnalyticsService.getBookstoreAnalytics(bookstoreId, parseInt(days));
    
    res.json({
      success: true,
      bookstore: {
        id: bookstore.id,
        name: bookstore.name,
        name_arabic: bookstore.name_arabic,
        governorate: bookstore.governorate
      },
      analytics,
      period: {
        days: parseInt(days),
        startDate: analytics.period.startDate,
        endDate: analytics.period.endDate
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'حدث خطأ في استخراج التحليلات' 
    });
  }
});

// @route   GET /api/analytics/search-trends
// @desc    Get search trends and popular queries
// @access  Public
router.get('/search-trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const searchTrends = await SearchQuery.findAll({
      attributes: [
        'query',
        [fn('COUNT', col('query')), 'search_count'],
        [fn('AVG', col('results_count')), 'avg_results'],
        [fn('MAX', col('created_at')), 'last_searched']
      ],
      where: {
        created_at: { [Op.gte]: startDate },
        query: { [Op.ne]: '' }
      },
      group: ['query'],
      order: [[literal('search_count'), 'DESC']],
      limit: 20,
      raw: true
    });
    
    // Daily search volume
    const dailySearches = await SearchQuery.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'search_count'],
        [fn('COUNT', fn('DISTINCT', col('query'))), 'unique_queries']
      ],
      where: {
        created_at: { [Op.gte]: startDate }
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });
    
    res.json({
      success: true,
      searchTrends,
      dailySearches,
      period: { days: parseInt(days), startDate, endDate: new Date() }
    });
  } catch (error) {
    console.error('Search trends error:', error);
    res.status(500).json({ 
      success: false,
      error: 'حدث خطأ في جلب اتجاهات البحث' 
    });
  }
});

// @route   GET /api/analytics/books/performance
// @desc    Get book performance analytics
// @access  Private (Bookstore owners only)
router.get('/books/performance', authenticateToken, requireBookstoreOwner, async (req, res) => {
  try {
    const { days = 30, limit = 20 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const bookPerformance = await sequelize.query(`
      SELECT 
        b.id,
        b.title,
        b.title_arabic,
        b.author,
        b.price,
        b.rating,
        b.total_reviews,
        b.view_count,
        COALESCE(sales.total_sold, 0) as total_sold,
        COALESCE(sales.revenue, 0) as revenue,
        COALESCE(recent_views.recent_views, 0) as recent_views
      FROM books b
      LEFT JOIN (
        SELECT 
          oi.book_id,
          SUM(oi.quantity) as total_sold,
          SUM(oi.quantity * oi.price) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'completed'
          AND o.created_at >= :startDate
        GROUP BY oi.book_id
      ) sales ON b.id = sales.book_id
      LEFT JOIN (
        SELECT 
          clicked_book_id as book_id,
          COUNT(*) as recent_views
        FROM search_queries
        WHERE clicked_book_id IS NOT NULL
          AND created_at >= :startDate
        GROUP BY clicked_book_id
      ) recent_views ON b.id = recent_views.book_id
      WHERE b.bookstore_id = :bookstoreId
        AND b.is_active = true
      ORDER BY COALESCE(sales.revenue, 0) DESC, b.view_count DESC
      LIMIT :limit
    `, {
      replacements: { 
        bookstoreId: req.bookstore.id, 
        startDate, 
        limit: parseInt(limit) 
      },
      type: QueryTypes.SELECT
    });
    
    res.json({
      success: true,
      books: bookPerformance,
      period: { days: parseInt(days), startDate, endDate: new Date() }
    });
  } catch (error) {
    console.error('Book performance error:', error);
    res.status(500).json({ 
      success: false,
      error: 'حدث خطأ في جلب أداء الكتب' 
    });
  }
});

module.exports = router;
