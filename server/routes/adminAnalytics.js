const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getAdminDashboard, exportAdminReport } = require('../controllers/adminAnalyticsController');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get comprehensive admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', 
  authenticateToken, 
  requireRole('admin'),
  getAdminDashboard
);

// @route   GET /api/admin/reports/export
// @desc    Export admin reports to Excel
// @access  Private (Admin only)
router.get('/reports/export', 
  authenticateToken, 
  requireRole('admin'),
  exportAdminReport
);

module.exports = router;
