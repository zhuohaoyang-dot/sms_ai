// src/models/reviewQueue.js
const { query } = require('../config/database');
const { convertToChicagoTime } = require('../utils/timezone');

class ReviewQueueModel {
  /**
   * Get review queue items with filters
   * @param {string} startDate - Start date (YYYY-MM-DD HH:mm:ss)
   * @param {string} endDate - End date (YYYY-MM-DD HH:mm:ss)
   * @param {number} limit - Number of records per page
   * @param {number} offset - Starting offset for pagination
   * @param {string} needHumanReview - Filter: 'all', 'yes', 'no'
   * @param {string} flagStatus - Filter: 'all', 'none', 'flag'
   * @returns {Promise<Array>}
   */
  async getReviewQueueItems(startDate, endDate, limit = 50, offset = 0, needHumanReview = 'all', flagStatus = 'all') {
    try {
      let whereConditions = [
        'rq.added_at BETWEEN ? AND ?'
      ];
      const params = [startDate, endDate];

      // Filter by need human review
      if (needHumanReview === 'yes') {
        whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.approved\') = false');
      } else if (needHumanReview === 'no') {
        whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.approved\') = true');
      }

      // Filter by flag status
      if (flagStatus === 'flag') {
        whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.flag\') IS NOT NULL');
        whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.flag\') != \'null\'');
      } else if (flagStatus === 'none') {
        whereConditions.push('(JSON_EXTRACT(ai.evaluate_result, \'$.flag\') IS NULL OR JSON_EXTRACT(ai.evaluate_result, \'$.flag\') = \'null\')');
      }

      const whereClause = whereConditions.join(' AND ');

      const sql = `
        SELECT
          rq.id,
          rq.ai_result_id,
          rq.matter_id,
          rq.reviewed,
          rq.review_notes,
          rq.added_at,
          rq.reviewed_at,
          ai.result_data,
          ai.evaluate_result,
          ai.modified_data,
          ai.created_time,
          m.matter_name,
          m.id as matter_digital_id
        FROM bl_review_queue rq
        LEFT JOIN bl_venture_ai.bl_ai_generate_result ai ON rq.ai_result_id = ai.id
        LEFT JOIN bl_venture_matter.bl_matter m ON rq.matter_id = m.matter_id
        WHERE ${whereClause}
        ORDER BY rq.added_at DESC
        LIMIT ? OFFSET ?
      `;

      params.push(limit, offset);

      const results = await query('bl_venture_ai', sql, params);

      return results.map(record => {
        // Parse JSON fields
        let resultData = {};
        let evaluateResult = {};
        let modifiedData = null;

        try {
          resultData = typeof record.result_data === 'string'
            ? JSON.parse(record.result_data)
            : record.result_data || {};
        } catch (e) {
          console.error('Error parsing result_data:', e);
        }

        try {
          evaluateResult = typeof record.evaluate_result === 'string'
            ? JSON.parse(record.evaluate_result)
            : record.evaluate_result || {};
        } catch (e) {
          console.error('Error parsing evaluate_result:', e);
        }

        try {
          if (record.modified_data) {
            modifiedData = typeof record.modified_data === 'string'
              ? JSON.parse(record.modified_data)
              : record.modified_data;
          }
        } catch (e) {
          // modified_data might be plain text
          modifiedData = record.modified_data;
        }

        return {
          id: record.id,
          aiResultId: record.ai_result_id,
          matterId: record.matter_id,
          matterDigitalId: record.matter_digital_id,
          matterName: record.matter_name,
          reviewed: Boolean(record.reviewed),
          reviewNotes: record.review_notes,
          addedAt: convertToChicagoTime(record.added_at),
          reviewedAt: record.reviewed_at ? convertToChicagoTime(record.reviewed_at) : null,
          resultData,
          evaluateResult,
          modifiedData,
          createdTime: convertToChicagoTime(record.created_time)
        };
      });
    } catch (error) {
      console.error('Error in getReviewQueueItems:', error);
      throw error;
    }
  }

  /**
   * Get total count of review queue items
   */
  async getReviewQueueCount(startDate, endDate, needHumanReview = 'all', flagStatus = 'all') {
    try {
      let whereConditions = [
        'rq.added_at BETWEEN ? AND ?'
      ];
      const params = [startDate, endDate];

      if (needHumanReview === 'yes') {
        whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.approved\') = false');
      } else if (needHumanReview === 'no') {
        whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.approved\') = true');
      }

      if (flagStatus === 'flag') {
        whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.flag\') IS NOT NULL');
        whereConditions.push('JSON_EXTRACT(ai.evaluate_result, \'$.flag\') != \'null\'');
      } else if (flagStatus === 'none') {
        whereConditions.push('(JSON_EXTRACT(ai.evaluate_result, \'$.flag\') IS NULL OR JSON_EXTRACT(ai.evaluate_result, \'$.flag\') = \'null\')');
      }

      const whereClause = whereConditions.join(' AND ');

      const sql = `
        SELECT COUNT(*) as total
        FROM bl_review_queue rq
        LEFT JOIN bl_venture_ai.bl_ai_generate_result ai ON rq.ai_result_id = ai.id
        WHERE ${whereClause}
      `;

      const results = await query('bl_venture_ai', sql, params);
      return results[0].total;
    } catch (error) {
      console.error('Error in getReviewQueueCount:', error);
      throw error;
    }
  }

  /**
   * Add items to review queue
   * @param {Array<number>} aiResultIds - Array of AI result IDs to add
   * @returns {Promise<Object>}
   */
  async addToReviewQueue(aiResultIds) {
    try {
      if (!aiResultIds || aiResultIds.length === 0) {
        return { success: false, message: 'No items to add' };
      }

      // First, get matter_id for each ai_result_id
      const placeholders = aiResultIds.map(() => '?').join(',');
      const selectSql = `
        SELECT id, matter_id
        FROM bl_ai_generate_result
        WHERE id IN (${placeholders})
      `;

      const aiResults = await query('bl_venture_ai', selectSql, aiResultIds);

      if (aiResults.length === 0) {
        return { success: false, message: 'No valid AI results found' };
      }

      // Insert into review queue (ignore duplicates)
      const values = aiResults.map(result =>
        `(${result.id}, ${result.matter_id ? `'${result.matter_id}'` : 'NULL'})`
      ).join(',');

      const insertSql = `
        INSERT IGNORE INTO bl_review_queue (ai_result_id, matter_id)
        VALUES ${values}
      `;

      await query('bl_venture_ai', insertSql);

      return {
        success: true,
        message: `Added ${aiResults.length} item(s) to review queue`,
        added: aiResults.length
      };
    } catch (error) {
      console.error('Error in addToReviewQueue:', error);
      throw error;
    }
  }

  /**
   * Mark item as reviewed
   * @param {number} id - Review queue ID
   * @param {string} notes - Review notes
   * @returns {Promise<Object>}
   */
  async markAsReviewed(id, notes = '') {
    try {
      const sql = `
        UPDATE bl_review_queue
        SET reviewed = TRUE,
            review_notes = ?,
            reviewed_at = NOW()
        WHERE id = ?
      `;

      await query('bl_venture_ai', sql, [notes, id]);

      return { success: true, message: 'Item marked as reviewed' };
    } catch (error) {
      console.error('Error in markAsReviewed:', error);
      throw error;
    }
  }

  /**
   * Mark item as unreviewed
   * @param {number} id - Review queue ID
   * @returns {Promise<Object>}
   */
  async markAsUnreviewed(id) {
    try {
      const sql = `
        UPDATE bl_review_queue
        SET reviewed = FALSE,
            review_notes = NULL,
            reviewed_at = NULL
        WHERE id = ?
      `;

      await query('bl_venture_ai', sql, [id]);

      return { success: true, message: 'Item marked as unreviewed' };
    } catch (error) {
      console.error('Error in markAsUnreviewed:', error);
      throw error;
    }
  }

  /**
   * Auto-populate review queue with flagged and needs review items
   * @param {string} startDate - Start date for checking
   * @param {string} endDate - End date for checking
   * @returns {Promise<Object>}
   */
  async autoPopulateReviewQueue(startDate, endDate) {
    try {
      // Find items that are flagged OR need human review and not already in queue
      const sql = `
        INSERT IGNORE INTO bl_review_queue (ai_result_id, matter_id)
        SELECT
          ai.id,
          ai.matter_id
        FROM bl_ai_generate_result ai
        WHERE ai.created_time BETWEEN ? AND ?
          AND ai.evaluate_result IS NOT NULL
          AND (
            JSON_EXTRACT(ai.evaluate_result, '$.approved') = false
            OR (
              JSON_EXTRACT(ai.evaluate_result, '$.flag') IS NOT NULL
              AND JSON_EXTRACT(ai.evaluate_result, '$.flag') != 'null'
            )
          )
          AND ai.id NOT IN (SELECT ai_result_id FROM bl_review_queue)
      `;

      const result = await query('bl_venture_ai', sql, [startDate, endDate]);

      return {
        success: true,
        message: `Auto-populated ${result.affectedRows} item(s) to review queue`,
        added: result.affectedRows
      };
    } catch (error) {
      console.error('Error in autoPopulateReviewQueue:', error);
      throw error;
    }
  }
}

module.exports = new ReviewQueueModel();
