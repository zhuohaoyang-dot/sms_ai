/**
 * Timezone utility for converting UTC to Chicago time (CST/CDT)
 * Uses native JavaScript Intl API for timezone conversion
 */

/**
 * Convert UTC date to Chicago time string
 * @param {Date|string} utcDate - UTC date (Date object or ISO string)
 * @returns {string} Formatted date string in Chicago time (YYYY-MM-DD HH:mm:ss CST/CDT)
 */
function convertToChicagoTime(utcDate) {
  if (!utcDate) {
    return null;
  }

  // Convert to Date object if string
  const date = utcDate instanceof Date ? utcDate : new Date(utcDate);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return null;
  }

  // Convert to Chicago timezone
  const chicagoTimeString = date.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // Format: MM/DD/YYYY, HH:mm:ss -> YYYY-MM-DD HH:mm:ss
  const [datePart, timePart] = chicagoTimeString.split(', ');
  const [month, day, year] = datePart.split('/');
  const formattedDate = `${year}-${month}-${day} ${timePart}`;

  // Determine if CST or CDT based on date
  const timezone = getChicagoTimezoneAbbr(date);

  return `${formattedDate} ${timezone}`;
}

/**
 * Get Chicago timezone abbreviation (CST or CDT) for a given date
 * @param {Date} date - Date to check
 * @returns {string} 'CST' or 'CDT'
 */
function getChicagoTimezoneAbbr(date) {
  // Get timezone offset for the date in Chicago
  const january = new Date(date.getFullYear(), 0, 1);
  const july = new Date(date.getFullYear(), 6, 1);

  const janOffset = january.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' }).split(' ').pop();
  const julyOffset = july.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' }).split(' ').pop();

  const currentOffset = date.toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' }).split(' ').pop();

  // If current offset matches July (summer), it's CDT, otherwise CST
  return currentOffset === julyOffset ? 'CDT' : 'CST';
}

/**
 * Convert Chicago time string back to UTC for database queries
 * @param {string} chicagoTimeString - Chicago time string (YYYY-MM-DD HH:mm:ss)
 * @returns {Date} UTC Date object
 */
function convertChicagoToUTC(chicagoTimeString) {
  if (!chicagoTimeString) {
    return null;
  }

  // Parse the Chicago time string
  const [datePart, timePart] = chicagoTimeString.split(' ');
  const [year, month, day] = datePart.split('-');
  const [hour, minute, second] = timePart ? timePart.split(':') : ['00', '00', '00'];

  // Create date string that will be interpreted as Chicago time
  const dateString = `${year}-${month}-${day}T${hour}:${minute}:${second || '00'}`;

  // Create a date assuming it's in Chicago timezone
  const chicagoDate = new Date(dateString + ' GMT-0600'); // Approximate, will adjust

  // Get the actual UTC equivalent
  const utcDate = new Date(chicagoDate.toLocaleString('en-US', { timeZone: 'UTC' }));

  return utcDate;
}

/**
 * Get current Chicago time
 * @returns {string} Current Chicago time formatted string
 */
function getCurrentChicagoTime() {
  return convertToChicagoTime(new Date());
}

/**
 * Format date for SQL queries (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateForSQL(date) {
  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    return null;
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

module.exports = {
  convertToChicagoTime,
  convertChicagoToUTC,
  getCurrentChicagoTime,
  getChicagoTimezoneAbbr,
  formatDateForSQL
};
