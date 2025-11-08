const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');

/**
 * Health check endpoint
 * Returns application and database status
 */
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      version: '1.0.0'
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    const healthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: error.message,
      version: '1.0.0'
    };
    
    res.status(503).json(healthStatus);
  }
});

/**
 * Readiness check endpoint
 * Returns whether the application is ready to serve requests
 */
router.get('/ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
});

/**
 * Liveness check endpoint
 * Returns whether the application is alive
 */
router.get('/alive', (req, res) => {
  res.status(200).json({ alive: true });
});

module.exports = router;
