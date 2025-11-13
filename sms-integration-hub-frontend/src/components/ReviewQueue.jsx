// src/components/ReviewQueue.jsx
import { useState, useEffect } from 'react';
import {
  filterReviewQueueItems,
  updateReviewStatus,
  removeFromReviewQueue
} from '../services/reviewQueueService';
import RecordModal from './RecordModal';
import './ReviewQueue.css';

function ReviewQueue({ filters }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const limit = 50;

  useEffect(() => {
    if (filters) {
      fetchItems();
    }
  }, [filters, currentPage]);

  const fetchItems = () => {
    if (!filters) return;

    setLoading(true);
    setError(null);

    try {
      // Get filtered items from localStorage
      const allItems = filterReviewQueueItems(filters);

      // Calculate pagination
      const startIndex = (currentPage - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = allItems.slice(startIndex, endIndex);
      const pages = Math.ceil(allItems.length / limit);

      setItems(paginatedItems);
      setTotalPages(pages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching review queue items:', err);
      setError('Failed to load review queue items');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewToggle = (id, currentStatus) => {
    try {
      const result = updateReviewStatus(id, !currentStatus);
      if (result.success) {
        // Refresh the items
        fetchItems();
      } else {
        alert('Failed to update review status');
      }
    } catch (err) {
      console.error('Error updating review status:', err);
      alert('Failed to update review status');
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getMatterLink = (record) => {
    if (!record.matterLink) return '#';
    return `https://${record.matterLink}`;
  };

  if (loading) {
    return (
      <div className="review-queue-container">
        <h2>Review Queue</h2>
        <div className="loading-message">Loading review queue items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-queue-container">
        <h2>Review Queue</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="review-queue-container">
      <div className="review-queue-header">
        <h2>Review Queue</h2>
        <div className="results-info">
          Showing {items.length} items (Page {currentPage} of {totalPages})
        </div>
      </div>

      <div className="table-container">
        <table className="review-queue-table">
          <thead>
            <tr>
              <th>Matter Link</th>
              <th>Reviewed</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">
                  No items in review queue for the selected filters
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.matterLink ? (
                      <a
                        href={getMatterLink(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="matter-link"
                      >
                        {item.matterName || 'View Matter'}
                      </a>
                    ) : (
                      <span className="no-matter">No Matter Link</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={`review-toggle ${item.reviewed ? 'reviewed' : 'not-reviewed'}`}
                      onClick={() => handleReviewToggle(item.id, item.reviewed)}
                    >
                      {item.reviewed ? 'Yes' : 'No'}
                    </button>
                  </td>
                  <td className="time-cell">{formatDate(item.addedAt)}</td>
                  <td>
                    <button
                      className="details-button"
                      onClick={() => handleViewDetails(item)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}

      {showModal && selectedItem && (
        <RecordModal record={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default ReviewQueue;
