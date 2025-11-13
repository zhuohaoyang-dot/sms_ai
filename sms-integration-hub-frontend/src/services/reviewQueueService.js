// src/services/reviewQueueService.js
// Local storage-based Review Queue service (no database needed)

const STORAGE_KEY = 'sms_review_queue';

/**
 * Get all review queue items from localStorage
 */
export const getReviewQueueItems = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading review queue from localStorage:', error);
    return [];
  }
};

/**
 * Add items to review queue
 * @param {Array} records - Array of record objects to add
 */
export const addToReviewQueue = (records) => {
  try {
    const queue = getReviewQueueItems();
    const recordIds = queue.map(item => item.id);

    // Only add records that aren't already in the queue
    const newRecords = records.filter(record => !recordIds.includes(record.id));

    newRecords.forEach(record => {
      queue.push({
        ...record,
        addedAt: new Date().toISOString(),
        reviewed: false,
        reviewNotes: ''
      });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return { success: true, added: newRecords.length };
  } catch (error) {
    console.error('Error adding to review queue:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update review status of an item
 * @param {number} id - Record ID
 * @param {boolean} reviewed - Review status
 * @param {string} notes - Review notes
 */
export const updateReviewStatus = (id, reviewed, notes = '') => {
  try {
    const queue = getReviewQueueItems();
    const index = queue.findIndex(item => item.id === id);

    if (index !== -1) {
      queue[index].reviewed = reviewed;
      queue[index].reviewNotes = notes;
      queue[index].reviewedAt = reviewed ? new Date().toISOString() : null;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      return { success: true };
    }

    return { success: false, error: 'Item not found' };
  } catch (error) {
    console.error('Error updating review status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove an item from review queue
 * @param {number} id - Record ID
 */
export const removeFromReviewQueue = (id) => {
  try {
    let queue = getReviewQueueItems();
    queue = queue.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return { success: true };
  } catch (error) {
    console.error('Error removing from review queue:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all items from review queue
 */
export const clearReviewQueue = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    console.error('Error clearing review queue:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Filter review queue items
 * @param {Object} filters - Filter criteria
 */
export const filterReviewQueueItems = (filters) => {
  let items = getReviewQueueItems();

  // Filter by date range
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate + ' 00:00:00').getTime();
    const end = new Date(filters.endDate + ' 23:59:59').getTime();

    items = items.filter(item => {
      const itemDate = new Date(item.addedAt).getTime();
      return itemDate >= start && itemDate <= end;
    });
  }

  // Filter by needHumanReview
  if (filters.needHumanReview === 'yes') {
    items = items.filter(item => !item.approved);
  } else if (filters.needHumanReview === 'no') {
    items = items.filter(item => item.approved);
  }

  // Filter by flag status
  if (filters.flagStatus === 'flag') {
    items = items.filter(item => item.flag && item.flag !== 'null' && item.flag !== '');
  } else if (filters.flagStatus === 'none') {
    items = items.filter(item => !item.flag || item.flag === 'null' || item.flag === '');
  }

  return items;
};

/**
 * Check if a record needs review (has flag or needs human review)
 * @param {Object} record - Record to check
 */
export const needsReview = (record) => {
  const hasFlag = record.flag && record.flag !== 'null' && record.flag !== '';
  const needsHumanReview = !record.approved;
  return hasFlag || needsHumanReview;
};

/**
 * Get timestamp for last sync
 */
export const getLastSyncTime = () => {
  try {
    const stored = localStorage.getItem('sms_review_queue_last_sync');
    return stored ? new Date(stored) : null;
  } catch (error) {
    console.error('Error reading last sync time:', error);
    return null;
  }
};

/**
 * Set timestamp for last sync
 */
export const setLastSyncTime = () => {
  try {
    localStorage.setItem('sms_review_queue_last_sync', new Date().toISOString());
  } catch (error) {
    console.error('Error setting last sync time:', error);
  }
};
