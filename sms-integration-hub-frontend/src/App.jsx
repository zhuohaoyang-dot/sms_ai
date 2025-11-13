// src/App.jsx
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import Backoffice from './components/Backoffice';
import ReviewQueue from './components/ReviewQueue';
import RightBar from './components/RightBar';
import { getBackofficeRecords } from './services/api';
import { addToReviewQueue, needsReview, setLastSyncTime } from './services/reviewQueueService';
import './App.css';

function App() {
  const [activePanel, setActivePanel] = useState('overview');

  // Selection mode state for Backoffice
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [syncing, setSyncing] = useState(false);

  // Initialize with default filters so data loads immediately
  const getDefaultOverviewFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 4);
    return {
      dateMode: 'range',
      startDate: fiveDaysAgo.toISOString().split('T')[0],
      endDate: today
    };
  };

  const getDefaultBackofficeFilters = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      needHumanReview: 'all',
      flagStatus: 'all'
    };
  };

  const getDefaultReviewQueueFilters = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      needHumanReview: 'all',
      flagStatus: 'all'
    };
  };

  const [backofficeFilters, setBackofficeFilters] = useState(getDefaultBackofficeFilters());
  const [overviewFilters, setOverviewFilters] = useState(getDefaultOverviewFilters());
  const [reviewQueueFilters, setReviewQueueFilters] = useState(getDefaultReviewQueueFilters());

  const handleApplyBackofficeFilters = (filters) => {
    setBackofficeFilters(filters);
  };

  const handleApplyOverviewFilters = (filters) => {
    setOverviewFilters(filters);
  };

  const handleApplyReviewQueueFilters = (filters) => {
    setReviewQueueFilters(filters);
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedItems([]); // Clear selections when toggling mode
  };

  const handleToggleItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleThrowToReview = async () => {
    if (selectedItems.length === 0) {
      return;
    }

    try {
      // Fetch the full records from the backend
      const result = await getBackofficeRecords(
        backofficeFilters.startDate,
        backofficeFilters.endDate,
        1,
        1000, // Get enough records to include all selected items
        backofficeFilters.needHumanReview,
        backofficeFilters.flagStatus
      );

      if (result.success) {
        // Filter to only selected records
        const selectedRecords = result.data.records.filter(record =>
          selectedItems.includes(record.id)
        );

        // Add to review queue in localStorage
        const addResult = addToReviewQueue(selectedRecords);

        if (addResult.success) {
          alert(`Successfully added ${addResult.added} item(s) to review queue`);
          setSelectedItems([]);
          setSelectionMode(false);
        } else {
          alert('Failed to add items to review queue');
        }
      } else {
        alert('Failed to fetch records');
      }
    } catch (error) {
      console.error('Error adding to review queue:', error);
      alert('Failed to add items to review queue');
    }
  };

  // Auto-sync function to fetch flagged and needs-review items
  const autoSyncReviewQueue = async () => {
    if (syncing) return; // Prevent multiple simultaneous syncs

    setSyncing(true);
    console.log('Starting auto-sync for Review Queue...');

    try {
      // Fetch records from 11/13 onwards
      const startDate = '2025-11-13';
      const endDate = new Date().toISOString().split('T')[0];

      // Fetch all records (increase limit to get all items)
      const result = await getBackofficeRecords(
        startDate,
        endDate,
        1,
        10000, // Large number to get all records
        'all', // Get all records regardless of review status
        'all'  // Get all records regardless of flag status
      );

      if (result.success) {
        // Filter records that need review (flagged OR needs human review)
        const recordsNeedingReview = result.data.records.filter(record => needsReview(record));

        console.log(`Found ${recordsNeedingReview.length} records needing review`);

        // Add to review queue
        const addResult = addToReviewQueue(recordsNeedingReview);

        if (addResult.success) {
          console.log(`Auto-synced: Added ${addResult.added} new item(s) to review queue`);
          setLastSyncTime();
        }
      }
    } catch (error) {
      console.error('Error during auto-sync:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Run auto-sync on app load
  useEffect(() => {
    autoSyncReviewQueue();
  }, []); // Empty dependency array means run once on mount

  return (
    <div className="dashboard-container">
      <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />

      <div className="main-content">
        {activePanel === 'overview' && (
          <Overview filters={overviewFilters} />
        )}
        {activePanel === 'backoffice' && (
          <Backoffice
            filters={backofficeFilters}
            selectionMode={selectionMode}
            selectedItems={selectedItems}
            onToggleItem={handleToggleItem}
          />
        )}
        {activePanel === 'reviewQueue' && (
          <ReviewQueue filters={reviewQueueFilters} />
        )}
      </div>

      <RightBar
        activePanel={activePanel}
        onApplyBackofficeFilters={handleApplyBackofficeFilters}
        onApplyOverviewFilters={handleApplyOverviewFilters}
        onApplyReviewQueueFilters={handleApplyReviewQueueFilters}
        selectionMode={selectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        selectedCount={selectedItems.length}
        onThrowToReview={handleThrowToReview}
        onSyncReviewQueue={autoSyncReviewQueue}
      />
    </div>
  );
}

export default App;