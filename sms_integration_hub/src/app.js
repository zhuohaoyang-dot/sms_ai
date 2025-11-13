// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const overviewRoutes = require('./routes/overview');
const backofficeRoutes = require('./routes/backoffice');
const reviewQueueRoutes = require('./routes/reviewQueue');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    name: 'Integration Hub Dashboard API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      overview: {
        metrics: 'GET /api/overview/metrics?period=daily&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD'
      },
      backoffice: {
        records: 'GET /api/backoffice/records?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&page=1&limit=50',
        recordDetail: 'GET /api/backoffice/record/:id'
      },
      reviewQueue: {
        items: 'GET /api/review-queue/items?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&page=1&limit=50',
        add: 'POST /api/review-queue/add',
        updateStatus: 'PUT /api/review-queue/:id/review',
        autoPopulate: 'POST /api/review-queue/auto-populate'
      }
    },
    documentation: 'See README.md for full API documentation'
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/overview', overviewRoutes);
app.use('/api/backoffice', backofficeRoutes);
app.use('/api/review-queue', reviewQueueRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Test database connection
    console.log('Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📊 Dashboard API ready at http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`\nAvailable endpoints:`);
      console.log(`  GET /api/overview/metrics`);
      console.log(`  GET /api/backoffice/records`);
      console.log(`  GET /api/backoffice/record/:id`);
      console.log(`  GET /api/review-queue/items`);
      console.log(`  POST /api/review-queue/add`);
      console.log(`  PUT /api/review-queue/:id/review`);
      console.log(`  POST /api/review-queue/auto-populate\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;