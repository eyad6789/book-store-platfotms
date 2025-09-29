const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token - user not found'
      });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Token is malformed'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'Something went wrong during authentication'
    });
  }
};

// Check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    next();
  };
};

// Check if user is bookstore owner
const requireBookstoreOwner = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'bookstore_owner') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only bookstore owners can perform this action'
      });
    }

    // Check if user has an approved bookstore
    const { Bookstore } = require('../models');
    const bookstore = await Bookstore.findOne({
      where: { 
        owner_id: req.user.id,
        is_approved: true 
      }
    });

    if (!bookstore) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You need an approved bookstore to perform this action'
      });
    }

    req.bookstore = bookstore;
    next();
  } catch (error) {
    console.error('Bookstore owner middleware error:', error);
    res.status(500).json({
      error: 'Authorization error',
      message: 'Something went wrong during authorization'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireBookstoreOwner,
  optionalAuth
};
