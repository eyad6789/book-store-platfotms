const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const bookstoreRoutes = require('./routes/bookstores');
const orderRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const analyticsRoutes = require('./routes/analytics');
const libraryBooksRoutes = require('./routes/libraryBooks');
const libraryDashboardRoutes = require('./routes/libraryDashboard');
const adminAnalyticsRoutes = require('./routes/adminAnalytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  // In development, effectively disable rate limiting to avoid 429s from rapid client refreshes/test scripts
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 200 : 10000),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip preflight requests and disable limiter entirely in non-production
    if (req.method === 'OPTIONS') return true;
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  },
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/bookstores', bookstoreRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/library', libraryBooksRoutes);
app.use('/api/library', libraryDashboardRoutes);
app.use('/api/admin', adminAnalyticsRoutes);

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'مرحباً بكم في المتنبي - أكبر متجر إلكتروني للكتب في العراق',
    message_en: 'Welcome to Al-Mutanabbi - Iraq\'s Largest Online Bookstore',
    version: '2.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      books: {
        list: 'GET /api/books',
        search: 'GET /api/books/search',
        categories: 'GET /api/books/categories',
        featured: 'GET /api/books/featured',
        details: 'GET /api/books/:id'
      },
      bookstores: {
        list: 'GET /api/bookstores',
        myBookstore: 'GET /api/bookstores/my-bookstore',
        details: 'GET /api/bookstores/:id'
      },
      library: {
        dashboard: 'GET /api/library/:bookstoreId/dashboard',
        books: 'GET /api/library/:bookstoreId/books',
        addBook: 'POST /api/library/:bookstoreId/books',
        shareBook: 'POST /api/library/books/:bookId/share',
        sharedBooks: 'GET /api/library/:bookstoreId/shared-books'
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard',
        exportReports: 'GET /api/admin/reports/export'
      },
      wishlist: {
        list: 'GET /api/wishlist',
        add: 'POST /api/wishlist/:bookId',
        remove: 'DELETE /api/wishlist/:bookId',
        check: 'GET /api/wishlist/check/:bookId'
      },
      analytics: {
        bookstore: 'GET /api/analytics/bookstore',
        searchTrends: 'GET /api/analytics/search-trends'
      }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Al-Mutanabbi server is running',
    timestamp: new Date().toISOString()
  });
});

// API route not found handler
app.use('/api/*', (req, res) => {
  console.log(`API route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found`,
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/books',
      'GET /api/books/search',
      'GET /api/books/categories',
      'GET /api/bookstores',
      'GET /api/wishlist',
      'GET /api/analytics/bookstore/:id'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details || err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Database connection and server startup
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database models (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Al-Mutanabbi server is running on port ${PORT}`);
      console.log(`📚 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

startServer();
