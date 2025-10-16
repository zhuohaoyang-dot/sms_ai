// src/components/Backoffice.jsx
import { useState, useEffect } from 'react';
import { ExternalLink, Eye, Check, X } from 'lucide-react';
import { getBackofficeRecords, getRecordDetail } from '../services/api';
import RecordModal from './RecordModal';
import './Backoffice.css';

function Backoffice() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    fetchRecords();
  }, [startDate, endDate, currentPage]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const result = await getBackofficeRecords(startDate, endDate, currentPage, limit);
      setRecords(result.data.records);
      setTotalPages(result.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to load records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (recordId) => {
    try {
      const result = await getRecordDetail(recordId);
      setSelectedRecord(result.data);
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to load record details:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="backoffice-container">
      {/* Header */}
      <div className="backoffice-header">
        <div className="header-left">
          <h1>Backoffice</h1>
          <p className="subtitle">AI generated results and evaluations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="date-filters">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button className="apply-btn" onClick={fetchRecords}>
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Matter Link</th>
                  <th>Need Human Review</th>
                  <th>Modified</th>
                  <th>Flag</th>
                  <th>Time</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <a
                        href={`https://${record.matterLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="matter-link"
                      >
                        {record.matterName || 'View Matter'}
                        <ExternalLink size={14} />
                      </a>
                    </td>
                    <td>
                      <span className={`status-badge ${!record.approved ? 'needs-review' : 'no-review'}`}>
                        {!record.approved ? (
                          <>
                            <Check size={14} /> Yes
                          </>
                        ) : (
                          <>
                            <X size={14} /> No
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={`modified-badge ${record.sendStatus === 2 ? 'modified' : 'not-modified'}`}>
                        {record.sendStatus === 2 ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`flag-badge ${record.flag !== 'null' ? 'flagged' : ''}`}>
                        {record.flag !== 'null' ? record.flag : 'None'}
                      </span>
                    </td>
                    <td className="time-cell">
                      {formatDate(record.createdTime)}
                    </td>
                    <td>
                      <button
                        className="details-btn"
                        onClick={() => handleViewDetails(record.id)}
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {modalOpen && selectedRecord && (
        <RecordModal
          record={selectedRecord}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Backoffice;