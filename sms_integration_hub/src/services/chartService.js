// src/services/chartService.js

class ChartService {
    /**
     * Prepare pie chart data for accuracy (send_status breakdown)
     * @param {number} sentWithoutModification - Count of send_status = 1
     * @param {number} sentWithModification - Count of send_status = 2
     */
    prepareAccuracyPieChart(sentWithoutModification, sentWithModification) {
      const total = sentWithoutModification + sentWithModification;
  
      return {
        labels: ['Sent Without Modification', 'Sent With Modification'],
        datasets: [{
          data: [sentWithoutModification || 0, sentWithModification || 0],
          backgroundColor: ['#10b981', '#3b82f6'],
          borderColor: ['#059669', '#2563eb'],
          borderWidth: 1
        }],
        total,
        percentages: total > 0 ? [
          ((sentWithoutModification / total) * 100).toFixed(1),
          ((sentWithModification / total) * 100).toFixed(1)
        ] : [0, 0]
      };
    }
  
    /**
     * Prepare pie chart data for flags
     * @param {number} flagged - Count of flagged records
     * @param {number} notFlagged - Count of non-flagged records
     */
    prepareFlagPieChart(flagged, notFlagged) {
      const total = flagged + notFlagged;
  
      return {
        labels: ['Not Flagged', 'Flagged'],
        datasets: [{
          data: [notFlagged || 0, flagged || 0],
          backgroundColor: ['#10b981', '#ef4444'],
          borderColor: ['#059669', '#dc2626'],
          borderWidth: 1
        }],
        total,
        percentages: total > 0 ? [
          ((notFlagged / total) * 100).toFixed(1),
          ((flagged / total) * 100).toFixed(1)
        ] : [0, 0]
      };
    }
  
    /**
     * Prepare line chart data for accuracy rate over time
     * @param {Array} timeSeriesData - Array of time-series records
     */
    prepareAccuracyLineChart(timeSeriesData) {
      const labels = [];
      const accuracyData = [];
      const sendableData = [];
      const approvedData = [];
  
      timeSeriesData.forEach(item => {
        labels.push(item.time_period);
        
        const accuracyRate = item.total_sendable > 0
          ? (item.approved_sent / item.total_sendable * 100)
          : 0;
  
        accuracyData.push(parseFloat(accuracyRate.toFixed(2)));
        sendableData.push(item.total_sendable);
        approvedData.push(item.approved_sent);
      });
  
      return {
        labels,
        datasets: [
          {
            label: 'Accuracy Rate (%)',
            data: accuracyData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ],
        rawData: {
          sendable: sendableData,
          approved: approvedData
        }
      };
    }
  
    /**
     * Prepare line chart data for flag rate over time
     * @param {Array} timeSeriesData - Array of time-series records
     */
    prepareFlagLineChart(timeSeriesData) {
      const labels = [];
      const flagData = [];
      const totalData = [];
      const flaggedData = [];
  
      timeSeriesData.forEach(item => {
        labels.push(item.time_period);
        
        const flagRate = item.total_records > 0
          ? (item.flagged_count / item.total_records * 100)
          : 0;
  
        flagData.push(parseFloat(flagRate.toFixed(2)));
        totalData.push(item.total_records);
        flaggedData.push(item.flagged_count);
      });
  
      return {
        labels,
        datasets: [
          {
            label: 'Flag Rate (%)',
            data: flagData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ],
        rawData: {
          total: totalData,
          flagged: flaggedData
        }
      };
    }
  
    /**
     * Prepare combined line chart with both accuracy and flag rates
     * @param {Array} timeSeriesData - Array of time-series records
     */
    prepareCombinedLineChart(timeSeriesData) {
      const labels = [];
      const accuracyData = [];
      const flagData = [];
  
      timeSeriesData.forEach(item => {
        labels.push(item.time_period);
        
        const accuracyRate = item.total_sendable > 0
          ? (item.approved_sent / item.total_sendable * 100)
          : 0;
  
        const flagRate = item.total_records > 0
          ? (item.flagged_count / item.total_records * 100)
          : 0;
  
        accuracyData.push(parseFloat(accuracyRate.toFixed(2)));
        flagData.push(parseFloat(flagRate.toFixed(2)));
      });
  
      return {
        labels,
        datasets: [
          {
            label: 'Accuracy Rate (%)',
            data: accuracyData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y'
          },
          {
            label: 'Flag Rate (%)',
            data: flagData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'y'
          }
        ]
      };
    }
  
    /**
     * Prepare bar chart for send status distribution
     * @param {Array} timeSeriesData - Array of time-series records with send_status breakdown
     */
    prepareSendStatusBarChart(timeSeriesData) {
      const labels = [];
      const withoutModification = [];
      const withModification = [];
  
      timeSeriesData.forEach(item => {
        labels.push(item.time_period);
        withoutModification.push(item.sent_without_modification || 0);
        withModification.push(item.sent_with_modification || 0);
      });
  
      return {
        labels,
        datasets: [
          {
            label: 'Sent Without Modification',
            data: withoutModification,
            backgroundColor: '#10b981',
            borderColor: '#059669',
            borderWidth: 1
          },
          {
            label: 'Sent With Modification',
            data: withModification,
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            borderWidth: 1
          }
        ]
      };
    }
  
    /**
     * Format time labels based on period
     * @param {string} period - 'daily', 'monthly', or 'yearly'
     * @param {string} dateString - Date string to format
     */
    formatTimeLabel(period, dateString) {
      const date = new Date(dateString);
  
      switch(period) {
        case 'yearly':
          return date.getFullYear().toString();
        
        case 'monthly':
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
        
        case 'daily':
        default:
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
      }
    }
  
    /**
     * Calculate statistical summary for chart data
     * @param {Array} data - Array of numeric values
     */
    calculateStats(data) {
      if (!data || data.length === 0) {
        return {
          min: 0,
          max: 0,
          avg: 0,
          total: 0
        };
      }
  
      const sum = data.reduce((acc, val) => acc + val, 0);
      const min = Math.min(...data);
      const max = Math.max(...data);
      const avg = sum / data.length;
  
      return {
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        avg: parseFloat(avg.toFixed(2)),
        total: data.length
      };
    }
  
    /**
     * Generate chart options for frontend
     * @param {string} chartType - Type of chart ('pie', 'line', 'bar')
     */
    getChartOptions(chartType) {
      const baseOptions = {
        responsive: true,
        maintainAspectRatio: false
      };
  
      switch(chartType) {
        case 'pie':
          return {
            ...baseOptions,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  font: { size: 12 }
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          };
  
        case 'line':
          return {
            ...baseOptions,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: (value) => value + '%'
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  padding: 20,
                  font: { size: 12 }
                }
              }
            }
          };
  
        case 'bar':
          return {
            ...baseOptions,
            scales: {
              y: {
                beginAtZero: true,
                stacked: false
              },
              x: {
                stacked: false
              }
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  padding: 20,
                  font: { size: 12 }
                }
              }
            }
          };
  
        default:
          return baseOptions;
      }
    }
  }
  
  module.exports = new ChartService();