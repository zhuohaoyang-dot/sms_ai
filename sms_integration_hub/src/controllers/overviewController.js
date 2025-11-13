// src/controllers/overviewController.js
const metricsService = require('../services/metricsService');

class OverviewController {
  /**
   * GET /api/overview/metrics
   * Query params: period (daily/monthly/yearly), startDate, endDate, dateMode (range/exact/month/year)
   */
  async getMetrics(req, res) {
    try {
      const { period = 'daily', startDate, endDate, dateMode = 'range' } = req.query;

      // Validate period
      const validPeriods = ['daily', 'monthly', 'yearly'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid period. Must be daily, monthly, or yearly'
        });
      }

      // Set default dates if not provided based on dateMode
      let start = startDate;
      let end = endDate;

      if (!start || !end) {
        const now = new Date();

        if (dateMode === 'exact' && startDate) {
          // Exact date: show past 5 days including the selected date
          const selectedDate = new Date(startDate);
          const fiveDaysAgo = new Date(selectedDate);
          fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 4); // -4 to include selected date = 5 days total
          start = fiveDaysAgo.toISOString().split('T')[0];
          end = startDate;
        } else if (dateMode === 'month' && startDate) {
          // Month selection: YYYY-MM format
          const [year, month] = startDate.split('-');
          const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
          const monthEnd = new Date(parseInt(year), parseInt(month), 0); // Last day of month
          start = monthStart.toISOString().split('T')[0];
          end = monthEnd.toISOString().split('T')[0];
        } else if (dateMode === 'year' && startDate) {
          // Year selection: YYYY format
          const year = startDate;
          start = `${year}-01-01`;
          end = `${year}-12-31`;
        } else {
          // Default range mode or fallback
          end = now.toISOString().split('T')[0];

          switch(period) {
            case 'yearly':
              start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
              break;
            case 'monthly':
              start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
              break;
            default: // daily - show last 5 days with daily granularity
              const fiveDaysAgo = new Date(now);
              fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 4); // -4 to include today = 5 days total
              start = fiveDaysAgo.toISOString().split('T')[0];
          }
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