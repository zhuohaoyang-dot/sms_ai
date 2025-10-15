// src/routes/backoffice.js
const express = require('express');
const router = express.Router();
const backofficeController = require('../controllers/backofficeController');

/**
 * GET /api/backoffice/records
 * Get paginated records for backoffice table
 * Query params:
 *   - startDate: YYYY-MM-DD (required)
 *   - endDate: YYYY-MM-DD (required)
 *   - page: number (default: 1)
 *   - limit: number (default: 50)
 */
router.get('/records', backofficeController.getRecords.bind(backofficeController));

/**
 * GET /api/backoffice/record/:id
 * Get single record detail for modal popup
 */
router.get('/record/:id', backofficeController.getRecordDetail.bind(backofficeController));

module.exports = router;