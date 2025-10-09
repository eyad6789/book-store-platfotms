const { sequelize } = require('../config/database');
const { LibraryBook, Order, OrderItem, User, BookReview, Bookstore } = require('../models');
const { Op } = require('sequelize');

// Get comprehensive analytics for a library
const getLibraryAnalytics = async (req, res) => {
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
    const overviewMetrics = await getOverviewMetrics(bookstoreId, startDate);
    
    // 2. Performance Data
    const performanceData = await getPerformanceData(bookstoreId, startDate);
    
    // 3. Book Analytics
    const bookAnalytics = await getBookAnalytics(bookstoreId, startDate);
    
    // 4. Customer Analytics
    const customerAnalytics = await getCustomerAnalytics(bookstoreId, startDate);

    res.json({
      success: true,
      data: {
        overview: overviewMetrics,
        performance: performanceData,
        books: bookAnalytics,
        customers: customerAnalytics,
        dateRange: {
          startDate,
          endDate: new Date(),
          days: parseInt(days)
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ في تحميل التحليلات'
    });
  }
};

// Get overview metrics
const getOverviewMetrics = async (bookstoreId, startDate) => {
  try {
    // Total books
    const totalBooks = await LibraryBook.count({
      where: { bookstore_id: bookstoreId }
    });

    // Total orders and revenue
    const orderStats = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: LibraryBook,
          as: 'book',
          where: { bookstore_id: bookstoreId }
        }]
      }],
      where: {
        created_at: { [Op.gte]: startDate },
        status: { [Op.in]: ['confirmed', 'processing', 'shipped', 'delivered'] }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Order.id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue']
      ],
      raw: true
    });

    // Unique customers
    const uniqueCustomers = await Order.count({
      distinct: true,
      col: 'customer_id',
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: LibraryBook,
          as: 'book',
          where: { bookstore_id: bookstoreId }
        }]
      }],
      where: {
        created_at: { [Op.gte]: startDate }
      }
    });

    // Calculate growth rate (compare with previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const previousOrderStats = await Order.findAll({
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: LibraryBook,
          as: 'book',
          where: { bookstore_id: bookstoreId }
        }]
      }],
      where: {
        created_at: { 
          [Op.gte]: previousStartDate,
          [Op.lt]: startDate
        },
        status: { [Op.in]: ['confirmed', 'processing', 'shipped', 'delivered'] }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'previousRevenue']
      ],
      raw: true
    });

    const currentRevenue = parseFloat(orderStats[0]?.totalRevenue || 0);
    const previousRevenue = parseFloat(previousOrderStats[0]?.previousRevenue || 0);
    const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Average rating
    const avgRating = await BookReview.findAll({
      include: [{
        model: LibraryBook,
        as: 'book',
        where: { bookstore_id: bookstoreId }
      }],
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ],
      raw: true
    });

    return {
      totalBooks,
      totalOrders: parseInt(orderStats[0]?.totalOrders || 0),
      totalRevenue: currentRevenue,
      totalCustomers: uniqueCustomers,
      growthRate: parseFloat(growthRate.toFixed(1)),
      averageRating: parseFloat(avgRating[0]?.averageRating || 0).toFixed(1),
      conversionRate: uniqueCustomers > 0 ? ((parseInt(orderStats[0]?.totalOrders || 0) / uniqueCustomers) * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Overview metrics error:', error);
    return {
      totalBooks: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      growthRate: 0,
      averageRating: 0,
      conversionRate: 0
    };
  }
};

// Get performance data
const getPerformanceData = async (bookstoreId, startDate) => {
  try {
    // Monthly revenue
    const monthlyRevenue = await sequelize.query(`
      SELECT 
        DATE_FORMAT(o.created_at, '%Y-%m') as month,
        SUM(o.total_amount) as revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN library_books lb ON oi.book_id = lb.id
      WHERE lb.bookstore_id = :bookstoreId 
        AND o.created_at >= :startDate
        AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
      GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, {
      replacements: { bookstoreId, startDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Top performing books
    const topBooks = await sequelize.query(`
      SELECT 
        lb.id,
        lb.title_arabic,
        lb.title,
        lb.author_arabic,
        lb.author,
        COUNT(oi.id) as sales,
        SUM(oi.quantity * oi.price) as revenue,
        COUNT(DISTINCT o.customer_id) as unique_customers
      FROM library_books lb
      LEFT JOIN order_items oi ON lb.id = oi.book_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
      WHERE lb.bookstore_id = :bookstoreId
        AND (o.created_at >= :startDate OR o.created_at IS NULL)
      GROUP BY lb.id
      ORDER BY revenue DESC, sales DESC
      LIMIT 10
    `, {
      replacements: { bookstoreId, startDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Category performance (if you have categories)
    const categoryPerformance = await sequelize.query(`
      SELECT 
        lb.category,
        COUNT(oi.id) as sales,
        SUM(oi.quantity * oi.price) as revenue
      FROM library_books lb
      LEFT JOIN order_items oi ON lb.id = oi.book_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
      WHERE lb.bookstore_id = :bookstoreId
        AND o.created_at >= :startDate
      GROUP BY lb.category
      ORDER BY revenue DESC
    `, {
      replacements: { bookstoreId, startDate },
      type: sequelize.QueryTypes.SELECT
    });

    return {
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: item.month,
        revenue: parseFloat(item.revenue || 0)
      })),
      topBooks: topBooks.map(book => ({
        id: book.id,
        title: book.title_arabic || book.title,
        author: book.author_arabic || book.author,
        sales: parseInt(book.sales || 0),
        revenue: parseFloat(book.revenue || 0),
        uniqueCustomers: parseInt(book.unique_customers || 0)
      })),
      categoryPerformance: categoryPerformance.map(cat => ({
        category: cat.category || 'غير محدد',
        sales: parseInt(cat.sales || 0),
        revenue: parseFloat(cat.revenue || 0)
      }))
    };
  } catch (error) {
    console.error('Performance data error:', error);
    return {
      monthlyRevenue: [],
      topBooks: [],
      categoryPerformance: []
    };
  }
};

// Get book analytics
const getBookAnalytics = async (bookstoreId, startDate) => {
  try {
    // Book status distribution
    const statusDistribution = await LibraryBook.findAll({
      where: { bookstore_id: bookstoreId },
      attributes: [
        'availability_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['availability_status'],
      raw: true
    });

    // Recently added books
    const recentBooks = await LibraryBook.findAll({
      where: { 
        bookstore_id: bookstoreId,
        created_at: { [Op.gte]: startDate }
      },
      order: [['created_at', 'DESC']],
      limit: 10,
      attributes: ['id', 'title_arabic', 'title', 'author_arabic', 'author', 'created_at']
    });

    return {
      statusDistribution: statusDistribution.map(item => ({
        status: item.availability_status,
        count: parseInt(item.count)
      })),
      recentBooks: recentBooks.map(book => ({
        id: book.id,
        title: book.title_arabic || book.title,
        author: book.author_arabic || book.author,
        addedDate: book.created_at
      })),
      totalBooks: await LibraryBook.count({ where: { bookstore_id: bookstoreId } })
    };
  } catch (error) {
    console.error('Book analytics error:', error);
    return {
      statusDistribution: [],
      recentBooks: [],
      totalBooks: 0
    };
  }
};

// Get customer analytics
const getCustomerAnalytics = async (bookstoreId, startDate) => {
  try {
    // New customers in period
    const newCustomers = await sequelize.query(`
      SELECT COUNT(DISTINCT o.customer_id) as count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN library_books lb ON oi.book_id = lb.id
      WHERE lb.bookstore_id = :bookstoreId 
        AND o.created_at >= :startDate
        AND o.customer_id NOT IN (
          SELECT DISTINCT o2.customer_id 
          FROM orders o2
          JOIN order_items oi2 ON o2.id = oi2.order_id
          JOIN library_books lb2 ON oi2.book_id = lb2.id
          WHERE lb2.bookstore_id = :bookstoreId 
            AND o2.created_at < :startDate
        )
    `, {
      replacements: { bookstoreId, startDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Repeat customers
    const repeatCustomers = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM (
        SELECT o.customer_id, COUNT(o.id) as order_count
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN library_books lb ON oi.book_id = lb.id
        WHERE lb.bookstore_id = :bookstoreId 
          AND o.created_at >= :startDate
        GROUP BY o.customer_id
        HAVING order_count > 1
      ) repeat_buyers
    `, {
      replacements: { bookstoreId, startDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Customer lifetime value
    const customerLTV = await sequelize.query(`
      SELECT 
        AVG(customer_total) as avg_ltv
      FROM (
        SELECT 
          o.customer_id,
          SUM(o.total_amount) as customer_total
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN library_books lb ON oi.book_id = lb.id
        WHERE lb.bookstore_id = :bookstoreId 
          AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
        GROUP BY o.customer_id
      ) customer_totals
    `, {
      replacements: { bookstoreId },
      type: sequelize.QueryTypes.SELECT
    });

    return {
      newCustomers: parseInt(newCustomers[0]?.count || 0),
      repeatCustomers: parseInt(repeatCustomers[0]?.count || 0),
      averageLifetimeValue: parseFloat(customerLTV[0]?.avg_ltv || 0),
      totalActiveCustomers: await sequelize.query(`
        SELECT COUNT(DISTINCT o.customer_id) as count
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN library_books lb ON oi.book_id = lb.id
        WHERE lb.bookstore_id = :bookstoreId 
          AND o.created_at >= :startDate
      `, {
        replacements: { bookstoreId, startDate },
        type: sequelize.QueryTypes.SELECT
      }).then(result => parseInt(result[0]?.count || 0))
    };
  } catch (error) {
    console.error('Customer analytics error:', error);
    return {
      newCustomers: 0,
      repeatCustomers: 0,
      averageLifetimeValue: 0,
      totalActiveCustomers: 0
    };
  }
};

module.exports = {
  getLibraryAnalytics
};
