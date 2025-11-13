// src/components/OverviewFilters.jsx
import { useState, useEffect } from 'react';
import './OverviewFilters.css';

function OverviewFilters({ onApplyFilters }) {
  const [dateMode, setDateMode] = useState('range');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exactDate, setExactDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Initialize with default values on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 4);
    const fiveDaysAgoStr = fiveDaysAgo.toISOString().split('T')[0];

    setExactDate(today);
    setEndDate(today);
    setStartDate(fiveDaysAgoStr);

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    setMonth(currentMonth);

    const currentYear = new Date().getFullYear().toString();
    setYear(currentYear);
  }, []);

  const handleApply = () => {
    let filters = {};

    switch (dateMode) {
      case 'exact':
        filters.dateMode = 'exact';
        filters.startDate = exactDate;
        break;
      case 'month':
        filters.dateMode = 'month';
        filters.startDate = month;
        break;
      case 'year':
        filters.dateMode = 'year';
        filters.startDate = year;
        break;
      case 'range':
      default:
        filters.dateMode = 'range';
        filters.startDate = startDate;
        filters.endDate = endDate;
        break;
    }

    onApplyFilters(filters);
  };

  return (
    <div className="overview-filters">
      <h3 className="filters-title">Date Selection</h3>

      <div className="filter-section">
        <label className="filter-label">Selection Mode</label>
        <select
          value={dateMode}
          onChange={(e) => setDateMode(e.target.value)}
          className="filter-select"
        >
          <option value="range">Date Range</option>
          <option value="exact">Exact Date</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>

      {dateMode === 'range' && (
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
      )}

      {dateMode === 'exact' && (
        <div className="filter-section">
          <label className="filter-label">Select Date</label>
          <input
            type="date"
            value={exactDate}
            onChange={(e) => setExactDate(e.target.value)}
            className="date-input"
          />
          <p className="filter-hint">Shows data for past 5 days including selected date</p>
        </div>
      )}

      {dateMode === 'month' && (
        <div className="filter-section">
          <label className="filter-label">Select Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="date-input"
          />
        </div>
      )}

      {dateMode === 'year' && (
        <div className="filter-section">
          <label className="filter-label">Select Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="2020"
            max="2030"
            className="date-input"
          />
        </div>
      )}

      <button onClick={handleApply} className="apply-button">
        Apply Filters
      </button>
    </div>
  );
}

export default OverviewFilters;
