// src/models/matter.js
const { query } = require('../config/database');

class MatterModel {
  constructor() {
    this.dbName = process.env.DB_NAME_MATTER;
  }

  /**
   * Get matter by ID
   * @param {string} matterId - Matter ID
   */
  async getMatterById(matterId) {
    const sql = `
      SELECT 
        id as matter_digital_id,
        matter_name
      FROM bl_venture_matter.bl_matter
      WHERE id = ?
    `;

    const results = await query(this.dbName, sql, [matterId]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get multiple matters by IDs
   * @param {Array<string>} matterIds - Array of matter IDs
   */
  async getMattersByIds(matterIds) {
    if (!matterIds || matterIds.length === 0) {
      return [];
    }

    const placeholders = matterIds.map(() => '?').join(',');
    const sql = `
      SELECT 
        id as matter_digital_id,
        matter_name
      FROM bl_venture_matter.bl_matter
      WHERE id IN (${placeholders})
    `;

    return await query(this.dbName, sql, matterIds);
  }

  /**
   * Search matters by name
   * @param {string} searchTerm - Search term for matter name
   * @param {number} limit - Maximum results to return
   */
  async searchMattersByName(searchTerm, limit = 20) {
    const sql = `
      SELECT 
        id as matter_digital_id,
        matter_name
      FROM bl_venture_matter.bl_matter
      WHERE matter_name LIKE ?
      ORDER BY matter_name
      LIMIT ?
    `;

    return await query(this.dbName, sql, [`%${searchTerm}%`, limit]);
  }

  /**
   * Get all matters (paginated)
   * @param {number} limit - Results per page
   * @param {number} offset - Offset for pagination
   */
  async getAllMatters(limit = 50, offset = 0) {
    const sql = `
      SELECT 
        id as matter_digital_id,
        matter_name
      FROM bl_venture_matter.bl_matter
      ORDER BY matter_name
      LIMIT ? OFFSET ?
    `;

    return await query(this.dbName, sql, [limit, offset]);
  }

  /**
   * Get total count of matters
   */
  async getMatterCount() {
    const sql = `SELECT COUNT(*) as total FROM bl_venture_matter.bl_matter`;
    const result = await query(this.dbName, sql);
    return result[0].total;
  }

  /**
   * Check if matter exists
   * @param {string} matterId - Matter ID
   */
  async matterExists(matterId) {
    const sql = `
      SELECT EXISTS(
        SELECT 1 FROM bl_venture_matter.bl_matter WHERE id = ?
      ) as exists_flag
    `;

    const result = await query(this.dbName, sql, [matterId]);
    return result[0].exists_flag === 1;
  }
}

module.exports = new MatterModel();