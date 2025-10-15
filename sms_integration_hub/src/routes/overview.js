// src/routes/overview.js
const express = require('express');
const router = express.Router();
const overviewController = require('../controllers/overviewController');

/**
 * GET /api/overview/metrics
 * Get dashboard metrics with pie chart and line chart data
 * Query params:
 *   - period: 'daily' | 'monthly' | 'yearly' (default: 'daily')
 *   - startDate: YYYY-MM-DD (optional, defaults based on period)
 *   - endDate: YYYY-MM-DD (optional, defaults to today)
 */
router.get('/metrics', overviewController.getMetrics.bind(overviewController));

module.exports = router;