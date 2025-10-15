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
      approved_sent,
      flagged_count,
      total_records
    } = metricsData;

    const accuracyRate = total_sendable > 0 
      ? (approved_sent / total_sendable * 100).toFixed(2) 
      : 0;
    
    const flagRate = total_records > 0 
      ? (flagged_count / total_records * 100).toFixed(2) 
      : 0;

    return {
      accuracyRate: {
        send: approved_sent,
        total: total_sendable,
        rate: parseFloat(accuracyRate)
      },
      flagRate: {
        flagged: flagged_count,
        total: total_records,
        rate: parseFloat(flagRate)
      }
    };
  }

  /**
   * Prepare pie chart data using chartService
   */
  preparePieChartData(metricsData) {
    const {
      sent_without_modification,
      sent_with_modification,
      flagged_count,
      total_records
    } = metricsData;

    return {
      accuracyPie: chartService.prepareAccuracyPieChart(
        sent_without_modification || 0,
        sent_with_modification || 0
      ),
      flagPie: chartService.prepareFlagPieChart(
        flagged_count || 0,
        (total_records - flagged_count) || 0
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

    // Get aggregate metrics
    const metricsData = await aiResultModel.getMetrics(startDate, endDate);
    
    // Get time series data
    const timeSeriesData = await aiResultModel.getTimeSeriesData(
      startDate, 
      endDate, 
      groupBy
    );

    // Calculate rates
    const rates = this.calculateRates(metricsData);

    // Prepare chart data
    const pieChartData = this.preparePieChartData(metricsData);
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
      rawMetrics: metricsData,
      period
    };
  }
}

module.exports = new MetricsService();