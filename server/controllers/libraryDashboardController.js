const { Op, fn, col, literal } = require('sequelize');
const { 
  Bookstore, 
  LibraryBook, 
  LibraryMetric, 
  UserActivity, 
  BookShare,
  Order,
  OrderItem,
  User,
  Category
} = require('../models');

// @route   GET /api/library/:bookstoreId/dashboard
// @desc    Get library dashboard data
// @access  Private (Bookstore owners only)
const getLibraryDashboard = async (req, res) => {
  try {
    const { bookstoreId } = req.params;
    const { days = 30 } = req.query;
    const userId = req.user.id;
    
    console.log('LibraryDashboard request:', { bookstoreId, userId, days });
    
    // Verify ownership
    const bookstore = await Bookstore.findOne({
      where: { id: bookstoreId, owner_id: userId }
    });
    
    if (!bookstore) {
      console.log('Bookstore not found or access denied:', { bookstoreId, userId });
      return res.status(403).json({ 
        error: 'غير مصرح بالوصول',
        message: 'لا يمكنك الوصول إلى هذه المكتبة'
      });
    }
    
    console.log('Bookstore found:', bookstore.name);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get current period metrics with error handling
    let currentMetrics, previousMetrics;
    try {
      currentMetrics = await getMetricsForPeriod(bookstoreId, startDate, new Date());
      console.log('Current metrics loaded successfully');
    } catch (error) {
      console.error('Error loading current metrics:', error);
      currentMetrics = getDefaultMetrics();
    }
    
    // Get previous period metrics for comparison
    try {
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - parseInt(days));
      previousMetrics = await getMetricsForPeriod(bookstoreId, previousStartDate, startDate);
      console.log('Previous metrics loaded successfully');
    } catch (error) {
      console.error('Error loading previous metrics:', error);
      previousMetrics = getDefaultMetrics();
    }
    
    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };
    
    // Get top performing books with error handling
    let topBooks = [];
    try {
      topBooks = await LibraryBook.findAll({
        where: { 
          bookstore_id: bookstoreId,
          status: 'approved'
        },
        order: [['sales_count', 'DESC']],
        limit: 5,
        attributes: [
          'id', 'title_ar', 'author_ar', 'price', 
          'sales_count', 'views_count', 'cover_image_url'
        ]
      });
      console.log('Top books loaded:', topBooks.length);
    } catch (error) {
      console.error('Error loading top books:', error);
      topBooks = [];
    }
    
    // Get recent orders with error handling
    let recentOrders = [];
    try {
      recentOrders = await Order.findAll({
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: LibraryBook,
                as: 'libraryBook',
                where: { bookstore_id: bookstoreId },
                attributes: ['id', 'title_ar']
              }
            ]
          },
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'full_name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 10
      });
      console.log('Recent orders loaded:', recentOrders.length);
    } catch (error) {
      console.error('Error loading recent orders:', error);
      recentOrders = [];
    }
    
    // Get shared books performance with error handling
    let sharedBooks = [];
    try {
      sharedBooks = await BookShare.findAll({
        where: { 
          is_active: true,
          expires_at: { [Op.gt]: new Date() }
        },
        include: [
          {
            model: LibraryBook,
            as: 'book',
            where: { bookstore_id: bookstoreId },
            attributes: ['id', 'title_ar', 'cover_image_url']
          }
        ],
        order: [['views_count', 'DESC']],
        limit: 5
      });
      console.log('Shared books loaded:', sharedBooks.length);
    } catch (error) {
      console.error('Error loading shared books:', error);
      sharedBooks = [];
    }
    
    // Get book status distribution with error handling
    let bookStatusDistribution = [];
    try {
      bookStatusDistribution = await LibraryBook.findAll({
        where: { bookstore_id: bookstoreId },
        attributes: [
          'status',
          [fn('COUNT', col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });
      console.log('Book status distribution loaded');
    } catch (error) {
      console.error('Error loading book status distribution:', error);
      bookStatusDistribution = [];
    }
    
    const dashboardData = {
      bookstore: {
        id: bookstore.id,
        name: bookstore.name_arabic || bookstore.name,
        is_approved: bookstore.is_approved
      },
      totalRevenue: currentMetrics.totalRevenue,
      revenueChange: calculateChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
      totalOrders: currentMetrics.totalOrders,
      ordersChange: calculateChange(currentMetrics.totalOrders, previousMetrics.totalOrders),
      totalViews: currentMetrics.totalViews,
      viewsChange: calculateChange(currentMetrics.totalViews, previousMetrics.totalViews),
      activeBooks: currentMetrics.activeBooks,
      pendingBooks: currentMetrics.pendingBooks,
      avgOrderValue: currentMetrics.avgOrderValue,
      conversionRate: currentMetrics.conversionRate,
      avgRating: currentMetrics.avgRating || 0,
      totalReviews: currentMetrics.totalReviews || 0,
      topBooks,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        customer_name: order.customer?.full_name,
        items_count: order.items?.length || 0
      })),
      sharedBooks: sharedBooks.map(share => ({
        id: share.book.id,
        title_ar: share.book.title_ar,
        cover_image_url: share.book.cover_image_url,
        views_count: share.views_count,
        clicks_count: share.clicks_count,
        conversions_count: share.conversions_count,
        share_type: share.share_type
      })),
      bookStatusDistribution: bookStatusDistribution.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {})
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Error fetching library dashboard:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب بيانات لوحة التحكم'
    });
  }
};

// Helper function to get metrics for a specific period
const getMetricsForPeriod = async (bookstoreId, startDate, endDate) => {
  try {
    // Get revenue and orders from LibraryMetric table
    const metricsData = await LibraryMetric.findAll({
      where: {
        bookstore_id: bookstoreId,
        metric_date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [fn('SUM', col('total_revenue')), 'totalRevenue'],
        [fn('SUM', col('total_orders')), 'totalOrders'],
        [fn('SUM', col('total_views')), 'totalViews'],
        [fn('AVG', col('avg_order_value')), 'avgOrderValue'],
        [fn('AVG', col('conversion_rate')), 'conversionRate']
      ],
      raw: true
    });
    
    const metrics = metricsData[0] || {};
    
    // Get book counts
    const bookCounts = await LibraryBook.findAll({
      where: { bookstore_id: bookstoreId },
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });
    
    const statusCounts = bookCounts.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});
    
    return {
      totalRevenue: parseFloat(metrics.totalRevenue) || 0,
      totalOrders: parseInt(metrics.totalOrders) || 0,
      totalViews: parseInt(metrics.totalViews) || 0,
      avgOrderValue: parseFloat(metrics.avgOrderValue) || 0,
      conversionRate: parseFloat(metrics.conversionRate) || 0,
      activeBooks: statusCounts.approved || 0,
      pendingBooks: statusCounts.pending || 0,
      rejectedBooks: statusCounts.rejected || 0,
      inactiveBooks: statusCounts.inactive || 0
    };
  } catch (error) {
    console.error('Error getting metrics for period:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalViews: 0,
      avgOrderValue: 0,
      conversionRate: 0,
      activeBooks: 0,
      pendingBooks: 0
    };
  }
};

// @route   GET /api/library/:bookstoreId/analytics
// @desc    Get detailed analytics for library
// @access  Private (Bookstore owners only)
const getLibraryAnalytics = async (req, res) => {
  try {
    const { bookstoreId } = req.params;
    const { days = 30, type = 'overview' } = req.query;
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
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    let analyticsData = {};
    
    switch (type) {
      case 'revenue':
        analyticsData = await getRevenueAnalytics(bookstoreId, startDate);
        break;
      case 'books':
        analyticsData = await getBooksAnalytics(bookstoreId, startDate);
        break;
      case 'customers':
        analyticsData = await getCustomersAnalytics(bookstoreId, startDate);
        break;
      case 'activity':
        analyticsData = await getActivityAnalytics(bookstoreId, startDate);
        break;
      default:
        analyticsData = await getOverviewAnalytics(bookstoreId, startDate);
    }
    
    res.json({
      success: true,
      type,
      period: `${days} days`,
      data: analyticsData
    });
    
  } catch (error) {
    console.error('Error fetching library analytics:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب التحليلات'
    });
  }
};

// Helper functions for different analytics types
const getRevenueAnalytics = async (bookstoreId, startDate) => {
  const dailyRevenue = await LibraryMetric.findAll({
    where: {
      bookstore_id: bookstoreId,
      metric_date: { [Op.gte]: startDate }
    },
    attributes: ['metric_date', 'total_revenue', 'total_orders', 'avg_order_value'],
    order: [['metric_date', 'ASC']]
  });
  
  return {
    dailyRevenue: dailyRevenue.map(day => ({
      date: day.metric_date,
      revenue: parseFloat(day.total_revenue),
      orders: day.total_orders,
      avgOrderValue: parseFloat(day.avg_order_value)
    }))
  };
};

const getBooksAnalytics = async (bookstoreId, startDate) => {
  const topSellingBooks = await LibraryBook.findAll({
    where: { 
      bookstore_id: bookstoreId,
      status: 'approved',
      sales_count: { [Op.gt]: 0 }
    },
    order: [['sales_count', 'DESC']],
    limit: 10,
    attributes: ['id', 'title_ar', 'author_ar', 'sales_count', 'views_count', 'price']
  });
  
  const categoryPerformance = await LibraryBook.findAll({
    where: { bookstore_id: bookstoreId },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['name_ar']
      }
    ],
    attributes: [
      [fn('SUM', col('sales_count')), 'totalSales'],
      [fn('SUM', col('views_count')), 'totalViews'],
      [fn('COUNT', col('LibraryBook.id')), 'bookCount']
    ],
    group: ['category.id', 'category.name_ar'],
    order: [[fn('SUM', col('sales_count')), 'DESC']],
    raw: true
  });
  
  return {
    topSellingBooks,
    categoryPerformance
  };
};

const getCustomersAnalytics = async (bookstoreId, startDate) => {
  // This would require more complex queries joining with orders
  // For now, return basic customer metrics
  return {
    newCustomers: 0,
    returningCustomers: 0,
    customerRetentionRate: 0
  };
};

const getActivityAnalytics = async (bookstoreId, startDate) => {
  const recentActivities = await UserActivity.findAll({
    where: {
      activity_type: { [Op.in]: ['view', 'purchase', 'add_to_cart'] },
      created_at: { [Op.gte]: startDate },
      entity_type: 'book'
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['full_name']
      }
    ],
    order: [['created_at', 'DESC']],
    limit: 50
  });
  
  return {
    recentActivities: recentActivities.map(activity => ({
      type: activity.activity_type,
      user: activity.user?.full_name || 'مجهول',
      timestamp: activity.created_at,
      metadata: activity.metadata
    }))
  };
};

const getOverviewAnalytics = async (bookstoreId, startDate) => {
  const metrics = await getMetricsForPeriod(bookstoreId, startDate, new Date());
  return metrics;
};

// Helper function to return default metrics when data is not available
const getDefaultMetrics = () => {
  return {
    totalRevenue: 0,
    totalOrders: 0,
    totalViews: 0,
    activeBooks: 0,
    pendingBooks: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    avgRating: 0,
    totalReviews: 0
  };
};

module.exports = {
  getLibraryDashboard,
  getLibraryAnalytics,
  getOverviewAnalytics,
  getRevenueAnalytics,
  getBooksAnalytics,
  getCustomersAnalytics,
  getActivityAnalytics
};
