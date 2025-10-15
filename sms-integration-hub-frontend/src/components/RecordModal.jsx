// src/components/RecordModal.jsx
import { X } from 'lucide-react';
import './RecordModal.css';

function RecordModal({ record, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Record Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Matter Information */}
          <div className="info-section">
            <h3>Matter Information</h3>
            <div className="info-item">
              <span className="info-label">Matter Name:</span>
              <span className="info-value">{record.matterName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Link:</span>
              <a
                href={`https://${record.matterLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="info-link"
              >
                {record.matterLink}
              </a>
            </div>
          </div>

          {/* Panel A: Result Data */}
          <div className="panel-section panel-a">
            <h3>Panel A: Result Data</h3>
            <div className="data-grid">
              <div className="data-item">
                <span className="data-label">Text:</span>
                <div className="data-value text-content">
                  {record.resultData?.text}
                </div>
              </div>

              <div className="data-item">
                <span className="data-label">Reply Action:</span>
                <span className="data-value badge">
                  {record.resultData?.replyAction}
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">Action:</span>
                <span className="data-value badge">
                  {record.resultData?.action}
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">Schedule At (UTC):</span>
                <span className="data-value">
                  {record.resultData?.scheduleAtUTC || 'N/A'}
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">Description:</span>
                <div className="data-value">
                  {record.resultData?.desc}
                </div>
              </div>
            </div>
          </div>

          {/* Panel B: Evaluate Result */}
          <div className="panel-section panel-b">
            <h3>Panel B: Evaluation Result</h3>
            <div className="data-grid">
              <div className="data-item">
                <span className="data-label">Approved:</span>
                <span className={`data-value status ${record.evaluateResult?.approved ? 'approved' : 'rejected'}`}>
                  {record.evaluateResult?.approved ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">Flag:</span>
                <span className={`data-value ${record.evaluateResult?.flag !== 'null' ? 'flagged' : ''}`}>
                  {record.evaluateResult?.flag || 'None'}
                </span>
              </div>

              <div className="data-item full-width">
                <span className="data-label">Reason:</span>
                <div className="data-value reason-content">
                  {record.evaluateResult?.reason}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="info-section">
            <h3>Additional Information</h3>
            <div className="info-item">
              <span className="info-label">Send Status:</span>
              <span className="info-value">
                {record.sendStatus === 1 ? 'Sent without modification' : 
                 record.sendStatus === 2 ? 'Sent with modification' : 
                 'Not sent'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Created Time:</span>
              <span className="info-value">
                {new Date(record.createdTime).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecordModal;