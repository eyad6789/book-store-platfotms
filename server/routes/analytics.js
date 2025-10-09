const express = require('express');
const { Op, fn, col, literal, QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Book, LibraryBook, Bookstore, User, Order, OrderItem, BookReview, SearchQuery } = require('../models');
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

// @route   GET /api/analytics/library/:bookstoreId
// @desc    Get comprehensive library analytics with real data
// @access  Private (Bookstore owners only)
router.get('/library/:bookstoreId', authenticateToken, async (req, res) => {
  try {
    const { bookstoreId } = req.params;
    const { days = 30 } = req.query;
    
    // Verify bookstore ownership
    const bookstore = await Bookstore.findOne({
      where: { 
        id: bookstoreId,
        owner_id: req.user.id 
      }
    });
    
    if (!bookstore) {
      return res.status(404).json({
        success: false,
        error: 'المكتبة غير موجودة أو ليس لديك صلاحية للوصول إليها'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // 1. Overview Metrics
    const totalBooks = await LibraryBook.count({
      where: { bookstore_id: bookstoreId }
    });

    // Total orders and revenue for library books
    const orderStats = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT o.id) as totalOrders,
        SUM(o.total_amount) as totalRevenue,
        COUNT(DISTINCT o.customer_id) as uniqueCustomers
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN library_books lb ON oi.book_id = lb.id
      WHERE lb.bookstore_id = :bookstoreId 
        AND o.created_at >= :startDate
        AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `, {
      replacements: { bookstoreId, startDate },
      type: QueryTypes.SELECT
    });

    // Previous period for growth calculation
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - parseInt(days));
    
    const previousOrderStats = await sequelize.query(`
      SELECT SUM(o.total_amount) as previousRevenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN library_books lb ON oi.book_id = lb.id
      WHERE lb.bookstore_id = :bookstoreId 
        AND o.created_at >= :previousStartDate
        AND o.created_at < :startDate
        AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
    `, {
      replacements: { bookstoreId, previousStartDate, startDate },
      type: QueryTypes.SELECT
    });

    const currentRevenue = parseFloat(orderStats[0]?.totalRevenue || 0);
    const previousRevenue = parseFloat(previousOrderStats[0]?.previousRevenue || 0);
    const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // 2. Top performing books
    const topBooks = await sequelize.query(`
      SELECT 
        lb.id,
        lb.title_arabic,
        lb.title,
        lb.author_arabic,
        lb.author,
        COUNT(oi.id) as sales,
        SUM(oi.quantity * oi.price) as revenue,
        COUNT(DISTINCT o.customer_id) as uniqueCustomers
      FROM library_books lb
      LEFT JOIN order_items oi ON lb.id = oi.book_id
      LEFT JOIN orders o ON oi.order_id = o.id 
        AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND o.created_at >= :startDate
      WHERE lb.bookstore_id = :bookstoreId
      GROUP BY lb.id, lb.title_arabic, lb.title, lb.author_arabic, lb.author
      ORDER BY revenue DESC, sales DESC
      LIMIT 10
    `, {
      replacements: { bookstoreId, startDate },
      type: QueryTypes.SELECT
    });

    // 3. Monthly revenue trend
    const monthlyRevenue = await sequelize.query(`
      SELECT 
        DATE_FORMAT(o.created_at, '%Y-%m') as month,
        MONTHNAME(o.created_at) as monthName,
        SUM(o.total_amount) as revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN library_books lb ON oi.book_id = lb.id
      WHERE lb.bookstore_id = :bookstoreId 
        AND o.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
      GROUP BY DATE_FORMAT(o.created_at, '%Y-%m'), MONTHNAME(o.created_at)
      ORDER BY month DESC
      LIMIT 12
    `, {
      replacements: { bookstoreId },
      type: QueryTypes.SELECT
    });

    // 4. Category performance
    const categoryPerformance = await sequelize.query(`
      SELECT 
        COALESCE(lb.category, 'غير محدد') as category,
        COUNT(lb.id) as bookCount,
        COUNT(oi.id) as sales,
        SUM(oi.quantity * oi.price) as revenue
      FROM library_books lb
      LEFT JOIN order_items oi ON lb.id = oi.book_id
      LEFT JOIN orders o ON oi.order_id = o.id 
        AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
        AND o.created_at >= :startDate
      WHERE lb.bookstore_id = :bookstoreId
      GROUP BY lb.category
      ORDER BY revenue DESC, sales DESC
    `, {
      replacements: { bookstoreId, startDate },
      type: QueryTypes.SELECT
    });

    // 5. Book status distribution
    const statusDistribution = await LibraryBook.findAll({
      where: { bookstore_id: bookstoreId },
      attributes: [
        'availability_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['availability_status'],
      raw: true
    });

    // 6. Average rating
    const avgRating = await sequelize.query(`
      SELECT AVG(br.rating) as averageRating
      FROM book_reviews br
      JOIN library_books lb ON br.book_id = lb.id
      WHERE lb.bookstore_id = :bookstoreId
    `, {
      replacements: { bookstoreId },
      type: QueryTypes.SELECT
    });

    // Format response data
    const overview = {
      totalBooks,
      totalOrders: parseInt(orderStats[0]?.totalOrders || 0),
      totalRevenue: currentRevenue,
      totalCustomers: parseInt(orderStats[0]?.uniqueCustomers || 0),
      growthRate: parseFloat(growthRate.toFixed(1)),
      averageRating: parseFloat(avgRating[0]?.averageRating || 0).toFixed(1),
      conversionRate: orderStats[0]?.uniqueCustomers > 0 ? 
        ((parseInt(orderStats[0]?.totalOrders || 0) / parseInt(orderStats[0]?.uniqueCustomers || 1)) * 100).toFixed(1) : 0
    };

    const performance = {
      topBooks: topBooks.map(book => ({
        id: book.id,
        title: book.title_arabic || book.title,
        author: book.author_arabic || book.author,
        sales: parseInt(book.sales || 0),
        revenue: parseFloat(book.revenue || 0),
        uniqueCustomers: parseInt(book.uniqueCustomers || 0)
      })),
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: item.month,
        monthName: item.monthName,
        revenue: parseFloat(item.revenue || 0)
      })),
      categoryPerformance: categoryPerformance.map(cat => ({
        category: cat.category,
        bookCount: parseInt(cat.bookCount || 0),
        sales: parseInt(cat.sales || 0),
        revenue: parseFloat(cat.revenue || 0)
      }))
    };

    const books = {
      statusDistribution: statusDistribution.map(item => ({
        status: item.availability_status,
        count: parseInt(item.count)
      })),
      totalBooks
    };

    const customers = {
      totalActive: parseInt(orderStats[0]?.uniqueCustomers || 0),
      newCustomers: parseInt(orderStats[0]?.uniqueCustomers || 0), // Simplified for now
      repeatCustomers: 0 // Can be calculated with more complex query
    };

    res.json({
      success: true,
      data: {
        overview,
        performance,
        books,
        customers,
        dateRange: {
          startDate,
          endDate: new Date(),
          days: parseInt(days)
        }
      },
      bookstore: {
        id: bookstore.id,
        name: bookstore.name,
        name_arabic: bookstore.name_arabic
      }
    });

  } catch (error) {
    console.error('Library analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في تحميل التحليلات',
      details: error.message
    });
  }
});

module.exports = router;
