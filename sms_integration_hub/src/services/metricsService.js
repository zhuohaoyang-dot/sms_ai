// src/services/metricsService.js
const aiResultModel = require('../models/aiGenerateResult');
const chartService = require('./chartService');

class MetricsService {
  /**
   * Calculate accuracy rate and flag rate
   */
  calculateRates(metricsData) {
    const {
      total_sendable,
      sent_without_modification,
      flagged_count
    } = metricsData;

    const accuracyRate = total_sendable > 0 
      ? (sent_without_modification / total_sendable * 100).toFixed(2) 
      : 0;
    
    const flagRate = total_sendable > 0 
      ? (flagged_count / total_sendable * 100).toFixed(2) 
      : 0;

    return {
      accuracyRate: {
        send: sent_without_modification,
        total: total_sendable,
        rate: parseFloat(accuracyRate)
      },
      flagRate: {
        flagged: flagged_count,
        total: total_sendable,
        rate: parseFloat(flagRate)
      }
    };
  }

  /**
   * Calculate period-specific metrics from time-series data
   * @param {Array} timeSeriesData - Time-series data array
   * @param {string} period - 'daily', 'monthly', or 'yearly'
   */
  calculatePeriodMetrics(timeSeriesData, period) {
    if (!timeSeriesData || timeSeriesData.length === 0) {
      return {
        total_records: 0,
        total_sendable: 0,
        sent_without_modification: 0,
        sent_with_modification: 0,
        flagged_count: 0
      };
    }

    let relevantData;

    switch(period) {
      case 'daily':
        // For daily view, use only the last day (most recent)
        relevantData = [timeSeriesData[timeSeriesData.length - 1]];
        break;
      
      case 'monthly':
      case 'yearly':
        // Sum all periods in the time series
        relevantData = timeSeriesData;
        break;
      
      default:
        relevantData = timeSeriesData;
    }

    // Aggregate the relevant data - ensure all values are converted to numbers
    const aggregated = relevantData.reduce((acc, item) => {
      return {
        total_records: Number(acc.total_records) + Number(item.total_records || 0),
        total_sendable: Number(acc.total_sendable) + Number(item.total_sendable || 0),
        sent_without_modification: Number(acc.sent_without_modification) + Number(item.sent_without_modification || 0),
        sent_with_modification: Number(acc.sent_with_modification) + Number(item.sent_with_modification || 0),
        flagged_count: Number(acc.flagged_count) + Number(item.flagged_count || 0)
      };
    }, {
      total_records: 0,
      total_sendable: 0,
      sent_without_modification: 0,
      sent_with_modification: 0,
      flagged_count: 0
    });

    return aggregated;
  }

  /**
   * Prepare pie chart data using chartService
   */
  preparePieChartData(metricsData) {
    const {
      sent_without_modification,
      sent_with_modification,
      flagged_count,
      total_sendable
    } = metricsData;

    return {
      accuracyPie: chartService.prepareAccuracyPieChart(
        sent_without_modification || 0,
        sent_with_modification || 0
      ),
      flagPie: chartService.prepareFlagPieChart(
        flagged_count || 0,
        (total_sendable - flagged_count) || 0
      )
    };
  }

  /**
   * Prepare line chart data using chartService
   */
  prepareLineChartData(timeSeriesData) {
    return chartService.prepareCombinedLineChart(timeSeriesData);
  }

  /**
   * Get complete overview data
   */
  async getOverviewData(startDate, endDate, period = 'daily') {
    // Determine groupBy based on period
    let groupBy = 'day';
    if (period === 'monthly') {
      groupBy = 'month';
    } else if (period === 'yearly') {
      groupBy = 'year';
    }

    // Get aggregate metrics (still used for fallback/validation)
    const metricsData = await aiResultModel.getMetrics(startDate, endDate);
    
    // Get time series data
    const timeSeriesData = await aiResultModel.getTimeSeriesData(
      startDate, 
      endDate, 
      groupBy
    );

    // Calculate period-specific metrics from time-series data
    const periodMetrics = this.calculatePeriodMetrics(timeSeriesData, period);

    // Calculate rates using period-specific metrics
    const rates = this.calculateRates(periodMetrics);

    // Prepare chart data using period-specific metrics
    const pieChartData = this.preparePieChartData(periodMetrics);
    const lineChartData = this.prepareLineChartData(timeSeriesData);

    // Calculate statistics for line chart data
    const accuracyStats = chartService.calculateStats(
      lineChartData.datasets[0].data
    );
    const flagStats = chartService.calculateStats(
      lineChartData.datasets[1].data
    );

    return {
      ...rates,
      pieChartData,
      lineChartData,
      statistics: {
        accuracy: accuracyStats,
        flag: flagStats
      },
      chartOptions: {
        pie: chartService.getChartOptions('pie'),
        line: chartService.getChartOptions('line')
      },
      rawMetrics: periodMetrics, // Use period-specific metrics instead of total
      period
    };
  }
}

module.exports = new MetricsService();