// src/components/BackofficeFilters.jsx
import { useState } from 'react';
import './BackofficeFilters.css';

function BackofficeFilters({ onApplyFilters, selectionMode, onToggleSelectionMode, selectedCount, onThrowToReview }) {
  // Set default date range: last 7 days
  const getDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

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
    <div className="backoffice-filters">
      <h3 className="filters-title">Data Selection</h3>

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

      <div className="selection-mode-section">
        <div className="filter-section">
          <label className="filter-label">Selection Mode</label>
          <button
            onClick={onToggleSelectionMode}
            className={`selection-toggle ${selectionMode ? 'active' : ''}`}
          >
            {selectionMode ? 'Exit Selection Mode' : 'Enter Selection Mode'}
          </button>
        </div>

        {selectionMode && (
          <div className="throw-to-review-section">
            <p className="selected-count">{selectedCount} item(s) selected</p>
            <button
              onClick={onThrowToReview}
              className="throw-button"
              disabled={selectedCount === 0}
            >
              Throw to Review Queue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BackofficeFilters;
