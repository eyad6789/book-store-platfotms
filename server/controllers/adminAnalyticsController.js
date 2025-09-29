const { Op, fn, col, literal } = require('sequelize');
const ExcelJS = require('exceljs');
const { 
  User, 
  Bookstore, 
  LibraryBook, 
  Order, 
  OrderItem,
  UserActivity, 
  LibraryMetric,
  BookShare,
  Category
} = require('../models');

// @route   GET /api/admin/dashboard
// @desc    Get comprehensive admin dashboard data
// @access  Private (Admin only)
const getAdminDashboard = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get current period metrics
    const currentMetrics = await getAdminMetricsForPeriod(startDate, new Date());
    
    // Get previous period for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - parseInt(days));
    const previousMetrics = await getAdminMetricsForPeriod(previousStartDate, startDate);
    
    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };
    
    // Get platform overview data
    const platformData = await getPlatformOverview();
    
    // Get recent activities
    const recentActivities = await getRecentActivities(50);
    
    // Get top performing libraries
    const topLibraries = await getTopPerformingLibraries(10);
    
    // Get category distribution
    const categoryDistribution = await getCategoryDistribution();
    
    // Get monthly revenue trend
    const monthlyRevenue = await getMonthlyRevenueTrend(12);
    
    const dashboardData = {
      // Key metrics with growth
      totalRevenue: currentMetrics.totalRevenue,
      revenueGrowth: calculateChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
      totalOrders: currentMetrics.totalOrders,
      ordersGrowth: calculateChange(currentMetrics.totalOrders, previousMetrics.totalOrders),
      activeUsers: currentMetrics.activeUsers,
      usersGrowth: calculateChange(currentMetrics.activeUsers, previousMetrics.activeUsers),
      activeLibraries: currentMetrics.activeLibraries,
      librariesGrowth: calculateChange(currentMetrics.activeLibraries, previousMetrics.activeLibraries),
      
      // Platform health indicators
      avgOrderValue: currentMetrics.avgOrderValue,
      avgOrderValueGrowth: calculateChange(currentMetrics.avgOrderValue, previousMetrics.avgOrderValue),
      conversionRate: currentMetrics.conversionRate,
      avgRating: currentMetrics.avgRating,
      totalReviews: currentMetrics.totalReviews,
      
      // Detailed breakdowns
      users: {
        total: platformData.totalUsers,
        customers: platformData.totalCustomers,
        bookstoreOwners: platformData.totalBookstoreOwners,
        admins: platformData.totalAdmins,
        newThisMonth: platformData.newUsersThisMonth
      },
      
      libraries: {
        total: platformData.totalLibraries,
        approved: platformData.approvedLibraries,
        pending: platformData.pendingLibraries,
        rejected: platformData.rejectedLibraries
      },
      
      books: {
        total: platformData.totalBooks,
        approved: platformData.approvedBooks,
        pending: platformData.pendingBooks,
        shared: platformData.sharedBooks
      },
      
      engagement: {
        totalViews: currentMetrics.totalViews,
        totalShares: currentMetrics.totalShares,
        avgSessionDuration: currentMetrics.avgSessionDuration,
        bounceRate: currentMetrics.bounceRate
      },
      
      // Charts data
      monthlyRevenue,
      categoryDistribution,
      topLibraries,
      recentActivities
    };
    
    res.json({
      success: true,
      period: `${days} days`,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء جلب بيانات لوحة التحكم'
    });
  }
};

// Helper function to get admin metrics for a specific period
const getAdminMetricsForPeriod = async (startDate, endDate) => {
  try {
    // Aggregate metrics from all libraries
    const metricsData = await LibraryMetric.findAll({
      where: {
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
    
    // Get active users count
    const activeUsers = await User.count({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    
    // Get active libraries count
    const activeLibraries = await Bookstore.count({
      where: {
        is_approved: true,
        is_active: true
      }
    });
    
    // Get shares count
    const totalShares = await BookShare.count({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      }
    });
    
    return {
      totalRevenue: parseFloat(metrics.totalRevenue) || 0,
      totalOrders: parseInt(metrics.totalOrders) || 0,
      totalViews: parseInt(metrics.totalViews) || 0,
      avgOrderValue: parseFloat(metrics.avgOrderValue) || 0,
      conversionRate: parseFloat(metrics.conversionRate) || 0,
      activeUsers,
      activeLibraries,
      totalShares,
      avgRating: 4.2, // Placeholder - would calculate from reviews
      totalReviews: 0, // Placeholder
      avgSessionDuration: 0, // Placeholder
      bounceRate: 0 // Placeholder
    };
  } catch (error) {
    console.error('Error getting admin metrics:', error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalViews: 0,
      avgOrderValue: 0,
      conversionRate: 0,
      activeUsers: 0,
      activeLibraries: 0,
      totalShares: 0,
      avgRating: 0,
      totalReviews: 0
    };
  }
};

// Get platform overview statistics
const getPlatformOverview = async () => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalBookstoreOwners,
      totalAdmins,
      newUsersThisMonth,
      totalLibraries,
      approvedLibraries,
      pendingLibraries,
      rejectedLibraries,
      totalBooks,
      approvedBooks,
      pendingBooks,
      sharedBooks
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'customer' } }),
      User.count({ where: { role: 'bookstore_owner' } }),
      User.count({ where: { role: 'admin' } }),
      User.count({ 
        where: { 
          created_at: { 
            [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
          } 
        } 
      }),
      Bookstore.count(),
      Bookstore.count({ where: { is_approved: true } }),
      Bookstore.count({ where: { is_approved: false } }),
      Bookstore.count({ where: { is_approved: false } }), // Placeholder for rejected
      LibraryBook.count(),
      LibraryBook.count({ where: { status: 'approved' } }),
      LibraryBook.count({ where: { status: 'pending' } }),
      LibraryBook.count({ where: { is_shared: true } })
    ]);
    
    return {
      totalUsers,
      totalCustomers,
      totalBookstoreOwners,
      totalAdmins,
      newUsersThisMonth,
      totalLibraries,
      approvedLibraries,
      pendingLibraries,
      rejectedLibraries,
      totalBooks,
      approvedBooks,
      pendingBooks,
      sharedBooks
    };
  } catch (error) {
    console.error('Error getting platform overview:', error);
    return {};
  }
};

// Get recent activities across the platform
const getRecentActivities = async (limit = 50) => {
  try {
    const activities = await UserActivity.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['full_name', 'role']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      attributes: ['activity_type', 'entity_type', 'created_at', 'metadata']
    });
    
    return activities.map(activity => ({
      type: activity.activity_type,
      entity: activity.entity_type,
      user: activity.user?.full_name || 'مجهول',
      userRole: activity.user?.role,
      timestamp: activity.created_at,
      title: getActivityTitle(activity),
      description: getActivityDescription(activity)
    }));
  } catch (error) {
    console.error('Error getting recent activities:', error);
    return [];
  }
};

// Get top performing libraries
const getTopPerformingLibraries = async (limit = 10) => {
  try {
    const libraries = await Bookstore.findAll({
      where: { is_approved: true },
      include: [
        {
          model: LibraryBook,
          as: 'libraryBooks',
          attributes: []
        },
        {
          model: User,
          as: 'owner',
          attributes: ['full_name']
        }
      ],
      attributes: [
        'id',
        'name',
        'name_arabic',
        'created_at',
        [fn('SUM', col('libraryBooks.sales_count')), 'totalSales'],
        [fn('SUM', col('libraryBooks.views_count')), 'totalViews'],
        [fn('COUNT', col('libraryBooks.id')), 'totalBooks']
      ],
      group: ['Bookstore.id', 'owner.id'],
      order: [[fn('SUM', col('libraryBooks.sales_count')), 'DESC']],
      limit,
      raw: false
    });
    
    return libraries.map(library => ({
      id: library.id,
      name: library.name_arabic || library.name,
      owner: library.owner?.full_name,
      totalSales: parseInt(library.getDataValue('totalSales')) || 0,
      totalViews: parseInt(library.getDataValue('totalViews')) || 0,
      totalBooks: parseInt(library.getDataValue('totalBooks')) || 0,
      joinedDate: library.created_at
    }));
  } catch (error) {
    console.error('Error getting top libraries:', error);
    return [];
  }
};

// Get category distribution
const getCategoryDistribution = async () => {
  try {
    const distribution = await LibraryBook.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name_ar']
        }
      ],
      attributes: [
        [fn('COUNT', col('LibraryBook.id')), 'count'],
        [fn('SUM', col('sales_count')), 'totalSales']
      ],
      group: ['category.id', 'category.name_ar'],
      order: [[fn('COUNT', col('LibraryBook.id')), 'DESC']],
      limit: 10,
      raw: true
    });
    
    return distribution.map(item => ({
      category: item['category.name_ar'] || 'غير محدد',
      bookCount: parseInt(item.count),
      totalSales: parseInt(item.totalSales) || 0
    }));
  } catch (error) {
    console.error('Error getting category distribution:', error);
    return [];
  }
};

// Get monthly revenue trend
const getMonthlyRevenueTrend = async (months = 12) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const monthlyData = await LibraryMetric.findAll({
      where: {
        metric_date: { [Op.gte]: startDate }
      },
      attributes: [
        [fn('DATE_TRUNC', 'month', col('metric_date')), 'month'],
        [fn('SUM', col('total_revenue')), 'revenue'],
        [fn('SUM', col('total_orders')), 'orders']
      ],
      group: [fn('DATE_TRUNC', 'month', col('metric_date'))],
      order: [[fn('DATE_TRUNC', 'month', col('metric_date')), 'ASC']],
      raw: true
    });
    
    return monthlyData.map(item => ({
      month: item.month,
      revenue: parseFloat(item.revenue) || 0,
      orders: parseInt(item.orders) || 0
    }));
  } catch (error) {
    console.error('Error getting monthly revenue trend:', error);
    return [];
  }
};

// Helper functions for activity descriptions
const getActivityTitle = (activity) => {
  const titles = {
    register: 'تسجيل مستخدم جديد',
    login: 'تسجيل دخول',
    add_book: 'إضافة كتاب جديد',
    purchase: 'عملية شراء',
    share: 'مشاركة كتاب',
    view: 'مشاهدة',
    search: 'بحث'
  };
  return titles[activity.activity_type] || activity.activity_type;
};

const getActivityDescription = (activity) => {
  const metadata = activity.metadata || {};
  
  switch (activity.activity_type) {
    case 'add_book':
      return `تم إضافة كتاب: ${metadata.title}`;
    case 'purchase':
      return `تم شراء كتاب بقيمة ${metadata.amount} د.ع`;
    case 'share':
      return `تم مشاركة كتاب: ${metadata.title}`;
    default:
      return `نشاط ${activity.entity_type}`;
  }
};

// @route   GET /api/admin/reports/export
// @desc    Export admin reports to Excel
// @access  Private (Admin only)
const exportAdminReport = async (req, res) => {
  try {
    const { type = 'comprehensive', days = 30 } = req.query;
    
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Al-Mutanabbi Admin';
    workbook.created = new Date();
    
    switch (type) {
      case 'users':
        await generateUsersReport(workbook, days);
        break;
      case 'libraries':
        await generateLibrariesReport(workbook, days);
        break;
      case 'books':
        await generateBooksReport(workbook, days);
        break;
      case 'revenue':
        await generateRevenueReport(workbook, days);
        break;
      default:
        await generateComprehensiveReport(workbook, days);
    }
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=admin-report-${type}-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Error exporting admin report:', error);
    res.status(500).json({ 
      error: 'حدث خطأ أثناء تصدير التقرير'
    });
  }
};

// Report generation functions
const generateComprehensiveReport = async (workbook, days) => {
  // Overview sheet
  const overviewSheet = workbook.addWorksheet('نظرة عامة');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  const metrics = await getAdminMetricsForPeriod(startDate, new Date());
  const platformData = await getPlatformOverview();
  
  overviewSheet.addRow(['المؤشر', 'القيمة']);
  overviewSheet.addRow(['إجمالي الإيرادات', metrics.totalRevenue]);
  overviewSheet.addRow(['إجمالي الطلبات', metrics.totalOrders]);
  overviewSheet.addRow(['المستخدمين النشطين', metrics.activeUsers]);
  overviewSheet.addRow(['المكتبات النشطة', metrics.activeLibraries]);
  overviewSheet.addRow(['إجمالي المستخدمين', platformData.totalUsers]);
  overviewSheet.addRow(['إجمالي المكتبات', platformData.totalLibraries]);
  overviewSheet.addRow(['إجمالي الكتب', platformData.totalBooks]);
  
  // Style the header
  overviewSheet.getRow(1).font = { bold: true };
  overviewSheet.columns = [
    { width: 30 },
    { width: 20 }
  ];
};

const generateUsersReport = async (workbook, days) => {
  const sheet = workbook.addWorksheet('المستخدمين');
  
  const users = await User.findAll({
    attributes: ['id', 'full_name', 'email', 'role', 'created_at'],
    order: [['created_at', 'DESC']]
  });
  
  sheet.addRow(['الرقم', 'الاسم الكامل', 'البريد الإلكتروني', 'الدور', 'تاريخ التسجيل']);
  
  users.forEach(user => {
    sheet.addRow([
      user.id,
      user.full_name,
      user.email,
      user.role,
      user.created_at.toLocaleDateString('ar-IQ')
    ]);
  });
  
  sheet.getRow(1).font = { bold: true };
};

const generateLibrariesReport = async (workbook, days) => {
  const sheet = workbook.addWorksheet('المكتبات');
  
  const libraries = await Bookstore.findAll({
    include: [
      {
        model: User,
        as: 'owner',
        attributes: ['full_name']
      }
    ],
    order: [['created_at', 'DESC']]
  });
  
  sheet.addRow(['الرقم', 'اسم المكتبة', 'المالك', 'الحالة', 'تاريخ التسجيل']);
  
  libraries.forEach(library => {
    sheet.addRow([
      library.id,
      library.name_arabic || library.name,
      library.owner?.full_name,
      library.is_approved ? 'معتمدة' : 'في الانتظار',
      library.created_at.toLocaleDateString('ar-IQ')
    ]);
  });
  
  sheet.getRow(1).font = { bold: true };
};

const generateBooksReport = async (workbook, days) => {
  const sheet = workbook.addWorksheet('الكتب');
  
  const books = await LibraryBook.findAll({
    include: [
      {
        model: Bookstore,
        as: 'bookstore',
        attributes: ['name_arabic']
      }
    ],
    order: [['created_at', 'DESC']]
  });
  
  sheet.addRow(['الرقم', 'عنوان الكتاب', 'المؤلف', 'المكتبة', 'السعر', 'الحالة', 'المبيعات']);
  
  books.forEach(book => {
    sheet.addRow([
      book.id,
      book.title_ar,
      book.author_ar,
      book.bookstore?.name_arabic,
      book.price,
      book.status,
      book.sales_count
    ]);
  });
  
  sheet.getRow(1).font = { bold: true };
};

const generateRevenueReport = async (workbook, days) => {
  const sheet = workbook.addWorksheet('الإيرادات');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  const revenueData = await LibraryMetric.findAll({
    where: {
      metric_date: { [Op.gte]: startDate }
    },
    include: [
      {
        model: Bookstore,
        as: 'bookstore',
        attributes: ['name_arabic']
      }
    ],
    order: [['metric_date', 'DESC']]
  });
  
  sheet.addRow(['التاريخ', 'المكتبة', 'الإيرادات', 'الطلبات', 'متوسط قيمة الطلب']);
  
  revenueData.forEach(metric => {
    sheet.addRow([
      metric.metric_date,
      metric.bookstore?.name_arabic,
      metric.total_revenue,
      metric.total_orders,
      metric.avg_order_value
    ]);
  });
  
  sheet.getRow(1).font = { bold: true };
};

module.exports = {
  getAdminDashboard,
  exportAdminReport
};
