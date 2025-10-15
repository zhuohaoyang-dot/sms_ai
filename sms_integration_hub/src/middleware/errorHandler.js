// src/middleware/errorHandler.js

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
    console.error('Error:', err);
  
    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    res.status(statusCode).json({
      success: false,
      error: message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
  
  /**
   * 404 Not Found handler
   */
  function notFoundHandler(req, res) {
    res.status(404).json({
      success: false,
      error: 'Route not found',
      path: req.originalUrl
    });
  }
  
  module.exports = {
    errorHandler,
    notFoundHandler
  };