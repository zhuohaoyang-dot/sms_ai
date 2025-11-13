// src/components/Backoffice.jsx
import { useState, useEffect } from 'react';
import { ExternalLink, Eye, Check, X } from 'lucide-react';
import { getBackofficeRecords, getRecordDetail } from '../services/api';
import RecordModal from './RecordModal';
import './Backoffice.css';

function Backoffice({ filters, selectionMode, selectedItems, onToggleItem }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    if (filters) {
      setCurrentPage(1); // Reset to page 1 when filters change
      fetchRecords();
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (filters) {
      fetchRecords();
    }
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRecords = async () => {
    if (!filters) return;

    try {
      setLoading(true);
      const result = await getBackofficeRecords(
        filters.startDate,
        filters.endDate,
        currentPage,
        limit,
        filters.needHumanReview,
        filters.flagStatus
      );
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
    // Backend already returns Chicago time in format: "YYYY-MM-DD HH:mm:ss CST/CDT"
    // Just display it as-is
    return dateString || '';
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
                  {selectionMode && <th>Select</th>}
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
                    {selectionMode && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(record.id)}
                          onChange={() => onToggleItem(record.id)}
                          className="selection-checkbox"
                        />
                      </td>
                    )}
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