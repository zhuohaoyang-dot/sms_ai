// src/controllers/reviewQueueController.js
const reviewQueueModel = require('../models/reviewQueue');

class ReviewQueueController {
  /**
   * GET /api/review-queue/items
   * Query params: startDate, endDate, page, limit, needHumanReview, flagStatus
   */
  async getItems(req, res) {
    try {
      const {
        startDate,
        endDate,
        page = 1,
        limit = 50,
        needHumanReview = 'all',
        flagStatus = 'all'
      } = req.query;

      // Validate dates
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate and endDate are required'
        });
      }

      // Calculate offset for pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Add time to dates
      const startDateTime = `${startDate} 00:00:00`;
      const endDateTime = `${endDate} 23:59:59`;

      // Get items and total count
      const [items, total] = await Promise.all([
        reviewQueueModel.getReviewQueueItems(
          startDateTime,
          endDateTime,
          parseInt(limit),
          offset,
          needHumanReview,
          flagStatus
        ),
        reviewQueueModel.getReviewQueueCount(startDateTime, endDateTime, needHumanReview, flagStatus)
      ]);

      res.json({
        success: true,
        data: {
          items,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error in getItems:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch review queue items',
        message: error.message
      });
    }
  }

  /**
   * POST /api/review-queue/add
   * Body: { aiResultIds: [1, 2, 3] }
   */
  async addItems(req, res) {
    try {
      const { aiResultIds } = req.body;

      if (!aiResultIds || !Array.isArray(aiResultIds) || aiResultIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'aiResultIds array is required'
        });
      }

      const result = await reviewQueueModel.addToReviewQueue(aiResultIds);

      res.json(result);
    } catch (error) {
      console.error('Error in addItems:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add items to review queue',
        message: error.message
      });
    }
  }

  /**
   * PUT /api/review-queue/:id/review
   * Body: { reviewed: true/false, notes: 'optional notes' }
   */
  async updateReviewStatus(req, res) {
    try {
      const { id } = req.params;
      const { reviewed, notes = '' } = req.body;

      if (typeof reviewed !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'reviewed must be a boolean'
        });
      }

      let result;
      if (reviewed) {
        result = await reviewQueueModel.markAsReviewed(parseInt(id), notes);
      } else {
        result = await reviewQueueModel.markAsUnreviewed(parseInt(id));
      }

      res.json(result);
    } catch (error) {
      console.error('Error in updateReviewStatus:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update review status',
        message: error.message
      });
    }
  }

  /**
   * POST /api/review-queue/auto-populate
   * Body: { startDate, endDate }
   */
  async autoPopulate(req, res) {
    try {
      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'startDate and endDate are required'
        });
      }

      // Add time to dates
      const startDateTime = `${startDate} 00:00:00`;
      const endDateTime = `${endDate} 23:59:59`;

      const result = await reviewQueueModel.autoPopulateReviewQueue(startDateTime, endDateTime);

      res.json(result);
    } catch (error) {
      console.error('Error in autoPopulate:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to auto-populate review queue',
        message: error.message
      });
    }
  }
}

module.exports = new ReviewQueueController();
