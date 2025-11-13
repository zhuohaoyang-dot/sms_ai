// src/routes/reviewQueue.js
const express = require('express');
const router = express.Router();
const reviewQueueController = require('../controllers/reviewQueueController');

// Get review queue items with filters
router.get('/items', reviewQueueController.getItems);

// Add items to review queue
router.post('/add', reviewQueueController.addItems);

// Update review status of an item
router.put('/:id/review', reviewQueueController.updateReviewStatus);

// Auto-populate review queue with flagged/needs review items
router.post('/auto-populate', reviewQueueController.autoPopulate);

module.exports = router;
