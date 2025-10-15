// src/controllers/overviewController.js
const metricsService = require('../services/metricsService');

class OverviewController {
  /**
   * GET /api/overview/metrics
   * Query params: period (daily/monthly/yearly), startDate, endDate
   */
  async getMetrics(req, res) {
    try {
      const { period = 'daily', startDate, endDate } = req.query;

      // Validate period
      const validPeriods = ['daily', 'monthly', 'yearly'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid period. Must be daily, monthly, or yearly'
        });
      }

      // Set default dates if not provided
      let start = startDate;
      let end = endDate;

      if (!start || !end) {
        const now = new Date();
        end = now.toISOString().split('T')[0];

        switch(period) {
          case 'yearly':
            start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            break;
          case 'monthly':
            start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            break;
          default: // daily
            start = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
        }
      }

      // Add time to dates for proper comparison
      const startDateTime = `${start} 00:00:00`;
      const endDateTime = `${end} 23:59:59`;

      // Get overview data
      const data = await metricsService.getOverviewData(
        startDateTime,
        endDateTime,
        period
      );

      res.json({
        success: true,
        data,
        dateRange: {
          startDate: start,
          endDate: end,
          period
        }
      });

    } catch (error) {
      console.error('Error in getMetrics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics',
        message: error.message
      });
    }
  }
}

module.exports = new OverviewController();