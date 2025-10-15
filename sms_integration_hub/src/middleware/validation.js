// src/middleware/validation.js

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
  
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
  
  /**
   * Validate date range
   */
  function isValidDateRange(startDate, endDate) {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return false;
    }
  
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    return start <= end;
  }
  
  /**
   * Middleware: Validate overview metrics request
   */
  function validateOverviewMetrics(req, res, next) {
    const { period, startDate, endDate } = req.query;
  
    // Validate period if provided
    if (period) {
      const validPeriods = ['daily', 'monthly', 'yearly'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid period',
          message: 'Period must be one of: daily, monthly, yearly'
        });
      }
    }
  
    // Validate dates if both provided
    if (startDate && endDate) {
      if (!isValidDate(startDate)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid startDate',
          message: 'startDate must be in YYYY-MM-DD format'
        });
      }
  
      if (!isValidDate(endDate)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid endDate',
          message: 'endDate must be in YYYY-MM-DD format'
        });
      }
  
      if (!isValidDateRange(startDate, endDate)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date range',
          message: 'startDate must be before or equal to endDate'
        });
      }
    }
  
    next();
  }
  
  /**
   * Middleware: Validate backoffice records request
   */
  function validateBackofficeRecords(req, res, next) {
    const { startDate, endDate, page, limit } = req.query;
  
    // Validate required dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'Both startDate and endDate are required'
      });
    }
  
    if (!isValidDate(startDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid startDate',
        message: 'startDate must be in YYYY-MM-DD format'
      });
    }
  
    if (!isValidDate(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid endDate',
        message: 'endDate must be in YYYY-MM-DD format'
      });
    }
  
    if (!isValidDateRange(startDate, endDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date range',
        message: 'startDate must be before or equal to endDate'
      });
    }
  
    // Validate pagination parameters
    if (page) {
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          error: 'Invalid page',
          message: 'page must be a positive integer'
        });
      }
    }
  
    if (limit) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          error: 'Invalid limit',
          message: 'limit must be between 1 and 100'
        });
      }
    }
  
    next();
  }
  
  /**
   * Middleware: Validate record ID parameter
   */
  function validateRecordId(req, res, next) {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing record ID',
        message: 'Record ID is required'
      });
    }
  
    const recordId = parseInt(id);
    if (isNaN(recordId) || recordId < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid record ID',
        message: 'Record ID must be a positive integer'
      });
    }
  
    next();
  }
  
  /**
   * Generic validation helper
   */
  function validateRequired(fields) {
    return (req, res, next) => {
      const missingFields = [];
  
      fields.forEach(field => {
        const value = req.query[field] || req.params[field] || req.body[field];
        if (!value) {
          missingFields.push(field);
        }
      });
  
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: `The following fields are required: ${missingFields.join(', ')}`
        });
      }
  
      next();
    };
  }
  
  /**
   * Sanitize input to prevent SQL injection
   */
  function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove potentially dangerous characters
    return input
      .replace(/['"`;\\]/g, '')
      .trim();
  }
  
  /**
   * Middleware: Sanitize all request data
   */
  function sanitizeRequest(req, res, next) {
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = sanitizeInput(req.query[key]);
        }
      });
    }
  
    // Sanitize body parameters
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeInput(req.body[key]);
        }
      });
    }
  
    next();
  }
  
  module.exports = {
    isValidDate,
    isValidDateRange,
    validateOverviewMetrics,
    validateBackofficeRecords,
    validateRecordId,
    validateRequired,
    sanitizeInput,
    sanitizeRequest
  };