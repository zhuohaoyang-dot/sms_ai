// src/components/RightBar.jsx
import BackofficeFilters from './BackofficeFilters';
import OverviewFilters from './OverviewFilters';
import ReviewQueueFilters from './ReviewQueueFilters';
import './RightBar.css';

function RightBar({
  activePanel,
  onApplyBackofficeFilters,
  onApplyOverviewFilters,
  onApplyReviewQueueFilters,
  selectionMode,
  onToggleSelectionMode,
  selectedCount,
  onThrowToReview,
  onSyncReviewQueue
}) {
  return (
    <div className="right-bar">
      {activePanel === 'backoffice' && (
        <BackofficeFilters
          onApplyFilters={onApplyBackofficeFilters}
          selectionMode={selectionMode}
          onToggleSelectionMode={onToggleSelectionMode}
          selectedCount={selectedCount}
          onThrowToReview={onThrowToReview}
        />
      )}
      {activePanel === 'overview' && (
        <OverviewFilters onApplyFilters={onApplyOverviewFilters} />
      )}
      {activePanel === 'reviewQueue' && (
        <ReviewQueueFilters
          onApplyFilters={onApplyReviewQueueFilters}
          onSync={onSyncReviewQueue}
        />
      )}
    </div>
  );
}

export default RightBar;