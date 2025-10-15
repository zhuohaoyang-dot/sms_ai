// src/components/RightBar.jsx
import './RightBar.css';

function RightBar() {
  return (
    <div className="right-bar">
      <div className="right-bar-frame">
        <h3 className="frame-title">Quick Stats</h3>
        <div className="stat-item">
          <span className="stat-label">Total Records</span>
          <span className="stat-value">Loading...</span>
        </div>
      </div>

      <div className="right-bar-frame">
        <h3 className="frame-title">Recent Activity</h3>
        <div className="activity-item">
          <div className="activity-dot"></div>
          <span className="activity-text">System active</span>
        </div>
      </div>

      <div className="right-bar-frame">
        <h3 className="frame-title">Information</h3>
        <p className="info-text">
          Dashboard showing AI-generated results and evaluation metrics.
        </p>
      </div>
    </div>
  );
}

export default RightBar;