// src/models/aiGenerateResult.js
const { query } = require('../config/database');
const { convertToChicagoTime } = require('../utils/timezone');

class AIGenerateResultModel {
  constructor() {
    this.dbName = process.env.DB_NAME_AI;
    this.matterDbName = process.env.DB_NAME_MATTER;
  }

  /**
   * Get metrics for Overview Panel
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   */
  async getMetrics(startDate, endDate) {
    const sql = `
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN send_status IN (1, 2) THEN 1 ELSE 0 END) as total_sendable,
        SUM(CASE 
          WHEN JSON_EXTRACT(evaluate_result, '$.approved') = true 
          AND send_status IN (1, 2) 
          THEN 1 ELSE 0 
        END) as approved_sent,
        SUM(CASE 
          WHEN JSON_EXTRACT(evaluate_result, '$.flag') IS NOT NULL 
          AND JSON_EXTRACT(evaluate_result, '$.flag') != 'null'
          AND send_status IN (1, 2)
          THEN 1 ELSE 0 
        END) as flagged_count,
        SUM(CASE WHEN send_status = 1 THEN 1 ELSE 0 END) as sent_without_modification,
        SUM(CASE WHEN send_status = 2 THEN 1 ELSE 0 END) as sent_with_modification
      FROM bl_venture_ai.bl_ai_generate_result
      WHERE created_time BETWEEN ? AND ?
    `;
    
    const results = await query(this.dbName, sql, [startDate, endDate]);
    return results[0];
  }

  /**
   * Get time-series data for line chart
   * @param {string} startDate
   * @param {string} endDate
   * @param {string} groupBy - 'day', 'month', or 'year'
   */
  async getTimeSeriesData(startDate, endDate, groupBy = 'day') {
    let dateFormat;
    switch(groupBy) {
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const sql = `
      SELECT 
        DATE_FORMAT(created_time, '${dateFormat}') as time_period,
        COUNT(*) as total_records,
        SUM(CASE WHEN send_status IN (1, 2) THEN 1 ELSE 0 END) as total_sendable,
        SUM(CASE WHEN send_status = 1 THEN 1 ELSE 0 END) as sent_without_modification,
        SUM(CASE WHEN send_status = 2 THEN 1 ELSE 0 END) as sent_with_modification,
        SUM(CASE 
          WHEN JSON_EXTRACT(evaluate_result, '$.approved') = true 
          AND send_status IN (1, 2) 
          THEN 1 ELSE 0 
        END) as approved_sent,
        SUM(CASE 
          WHEN JSON_EXTRACT(evaluate_result, '$.flag') IS NOT NULL 
          AND JSON_EXTRACT(evaluate_result, '$.flag') != 'null'
          AND send_status IN (1, 2)
          THEN 1 ELSE 0 
        END) as flagged_count
      FROM bl_venture_ai.bl_ai_generate_result
      WHERE created_time BETWEEN ? AND ?
      GROUP BY time_period
      ORDER BY time_period ASC
    `;

    return await query(this.dbName, sql, [startDate, endDate]);
  }

  /**
     * Get records for Backoffice Panel with matter information
     * @param {string} startDate
     * @param {string} endDate
     * @param {number} limit
     * @param {number} offset
     * @param {string} needHumanReview - Filter: 'all', 'yes', 'no'
     * @param {string} flagStatus - Filter: 'all', 'none', 'flag'
     */
  async getBackofficeRecords(startDate, endDate, limit = 50, offset = 0, needHumanReview = 'all', flagStatus = 'all') {
    let whereConditions = [
      'ai.evaluate_result IS NOT NULL',
      'ai.created_time BETWEEN ? AND ?'
    ];
    const params = [startDate, endDate];

    // Add needHumanReview filter
    if (needHumanReview === 'yes') {
      whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.approved\') = false');
    } else if (needHumanReview === 'no') {
      whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.approved\') = true');
    }

    // Add flagStatus filter
    if (flagStatus === 'flag') {
      whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.flag\') IS NOT NULL');
      whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.flag\') != \'null\'');
    } else if (flagStatus === 'none') {
      whereConditions.push('(JSON_EXTRACT(ai.evaluate_result, \'$.flag\') IS NULL OR JSON_EXTRACT(ai.evaluate_result, \'$.flag\') = \'null\')');
    }

    const sql = `
      SELECT
        ai.id,
        ai.matter_id,
        ai.result_data,
        ai.evaluate_result,
        ai.send_status,
        ai.created_time,
        m.id as matter_digital_id,
        m.matter_name
      FROM bl_venture_ai.bl_ai_generate_result ai
      LEFT JOIN ${this.matterDbName}.bl_matter m ON ai.matter_id = m.matter_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ai.created_time DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);
    const records = await query(this.dbName, sql, params);
    
    // Parse JSON fields and format data
    return records.map(record => {
      let resultData = {};
      let evaluateResult = {};
      
      try {
        resultData = typeof record.result_data === 'string' 
          ? JSON.parse(record.result_data) 
          : record.result_data;
      } catch (e) {
        console.error('Error parsing result_data:', e);
      }

      try {
        evaluateResult = typeof record.evaluate_result === 'string'
          ? JSON.parse(record.evaluate_result)
          : record.evaluate_result;
      } catch (e) {
        console.error('Error parsing evaluate_result:', e);
      }

      return {
        id: record.id,
        matterLink: `app.bridgify.com/v2/matter/id/${record.matter_digital_id}/overview`,
        matterName: record.matter_name,
        text: resultData.text || '',
        approved: evaluateResult.approved || false,
        flag: evaluateResult.flag || 'null',
        sendStatus: record.send_status, // Add send_status for Modified column
        createdTime: convertToChicagoTime(record.created_time),
        // Complete data for modal
        resultData: {
          text: resultData.text || '',
          replyAction: resultData.replyAction || '',
          scheduleAtUTC: resultData.scheduleAtUTC || '',
          desc: resultData.desc || '',
          action: resultData.action || ''
        },
        evaluateResult: {
          reason: evaluateResult.reason || '',
          approved: evaluateResult.approved || false,
          flag: evaluateResult.flag || 'null'
        }
      };
    });
  }

  /**
   * Get total count for pagination
   * @param {string} startDate
   * @param {string} endDate
   * @param {string} needHumanReview - Filter: 'all', 'yes', 'no'
   * @param {string} flagStatus - Filter: 'all', 'none', 'flag'
   */
  async getBackofficeRecordsCount(startDate, endDate, needHumanReview = 'all', flagStatus = 'all') {
    let whereConditions = [
      'evaluate_result IS NOT NULL',
      'created_time BETWEEN ? AND ?'
    ];
    const params = [startDate, endDate];

    // Add needHumanReview filter
    if (needHumanReview === 'yes') {
      whereConditions.push('JSON_EXTRACT(evaluate_result, \'$.approved\') = false');
    } else if (needHumanReview === 'no') {
      whereConditions.push('JSON_EXTRACT(evaluate_result, \'$.approved\') = true');
    }

    // Add flagStatus filter
    if (flagStatus === 'flag') {
      whereConditions.push('JSON_EXTRACT(evaluate_result, \'$.flag\') IS NOT NULL');
      whereConditions.push('JSON_EXTRACT(evaluate_result, \'$.flag\') != \'null\'');
    } else if (flagStatus === 'none') {
      whereConditions.push('(JSON_EXTRACT(evaluate_result, \'$.flag\') IS NULL OR JSON_EXTRACT(evaluate_result, \'$.flag\') = \'null\')');
    }

    const sql = `
      SELECT COUNT(*) as total
      FROM bl_venture_ai.bl_ai_generate_result
      WHERE ${whereConditions.join(' AND ')}
    `;

    const result = await query(this.dbName, sql, params);
    return result[0].total;
  }
 
  /**
     * Get single record detail by ID
     */
  async getRecordById(id) {
    const sql = `
      SELECT 
        ai.id,
        ai.matter_id,
        ai.result_data,
        ai.modified_data,
        ai.evaluate_result,
        ai.send_status,
        ai.created_time,
        m.id as matter_digital_id,
        m.matter_name
      FROM bl_venture_ai.bl_ai_generate_result ai
      LEFT JOIN ${this.matterDbName}.bl_matter m ON ai.matter_id = m.matter_id
      WHERE ai.id = ?
    `;

    const records = await query(this.dbName, sql, [id]);
    
    if (records.length === 0) {
      return null;
    }

    const record = records[0];
    let resultData = {};
    let modifiedData = {};
    let evaluateResult = {};
    
    try {
      resultData = typeof record.result_data === 'string' 
        ? JSON.parse(record.result_data) 
        : record.result_data;
    } catch (e) {
      console.error('Error parsing result_data:', e);
    }

    try {
      // Check if modified_data is JSON or plain text
      if (record.modified_data) {
        if (typeof record.modified_data === 'string') {
          // Try to parse as JSON first
          try {
            modifiedData = JSON.parse(record.modified_data);
          } catch {
            // If JSON parsing fails, treat as plain text
            modifiedData = record.modified_data;
          }
        } else {
          modifiedData = record.modified_data;
        }
      }
    } catch (e) {
      console.error('Error parsing modified_data:', e);
    }

    try {
      evaluateResult = typeof record.evaluate_result === 'string'
        ? JSON.parse(record.evaluate_result)
        : record.evaluate_result;
    } catch (e) {
      console.error('Error parsing evaluate_result:', e);
    }

    return {
      id: record.id,
      matterLink: `app.bridgify.com/v2/matter/id/${record.matter_digital_id}/overview`,
      matterName: record.matter_name,
      resultData,
      modifiedData,
      evaluateResult,
      sendStatus: record.send_status,
      createdTime: convertToChicagoTime(record.created_time)
    };
  }
}

module.exports = new AIGenerateResultModel();