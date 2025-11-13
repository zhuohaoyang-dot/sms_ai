// src/components/ReviewQueueFilters.jsx
import { useState } from 'react';
import './ReviewQueueFilters.css';

function ReviewQueueFilters({ onApplyFilters, onSync }) {
  // Set default date range: last 30 days
  const getDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const defaults = getDefaultDates();
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [needHumanReview, setNeedHumanReview] = useState('all');
  const [flagStatus, setFlagStatus] = useState('all');

  const handleApply = () => {
    onApplyFilters({
      startDate,
      endDate,
      needHumanReview,
      flagStatus
    });
  };

  return (
    <div className="review-queue-filters">
      <h3 className="filters-title">Filters</h3>

      <div className="filter-section">
        <label className="filter-label">Date Range</label>
        <div className="date-inputs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
          />
          <span className="date-separator">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Need Human Review</label>
        <select
          value={needHumanReview}
          onChange={(e) => setNeedHumanReview(e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div className="filter-section">
        <label className="filter-label">Flag Status</label>
        <select
          value={flagStatus}
          onChange={(e) => setFlagStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="none">None</option>
          <option value="flag">Flag</option>
        </select>
      </div>

      <button onClick={handleApply} className="apply-button">
        Apply Filters
      </button>

      <div className="sync-section">
        <button onClick={onSync} className="sync-button">
          Sync from Backend
        </button>
        <p className="sync-hint">
          Fetch all flagged items and items needing human review from 11/13 onwards (If you need me to adjust it, feel free to stopby my desk)
        </p>
      </div>
    </div>
  );
}

export default ReviewQueueFilters;
