// src/controllers/backofficeController.js
const aiResultModel = require('../models/aiGenerateResult');

class BackofficeController {
  /**
   * GET /api/backoffice/records
   * Query params: startDate, endDate, page, limit
   */
  async getRecords(req, res) {
    try {
      const {
        startDate,
        endDate,
        page = 1,
        limit = 50
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

      // Get records and total count
      const [records, total] = await Promise.all([
        aiResultModel.getBackofficeRecords(
          startDateTime,
          endDateTime,
          parseInt(limit),
          offset
        ),
        aiResultModel.getBackofficeRecordsCount(startDateTime, endDateTime)
      ]);

      res.json({
        success: true,
        data: {
          records,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        },
        dateRange: {
          startDate,
          endDate
        }
      });

    } catch (error) {
      console.error('Error in getRecords:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve records',
        message: error.message
      });
    }
  }

  /**
   * GET /api/backoffice/record/:id
   * Get single record detail for modal
   */
  async getRecordDetail(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Record ID is required'
        });
      }

      const record = await aiResultModel.getRecordById(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: 'Record not found'
        });
      }

      res.json({
        success: true,
        data: record
      });

    } catch (error) {
      console.error('Error in getRecordDetail:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve record detail',
        message: error.message
      });
    }
  }
}

module.exports = new BackofficeController();