-- Migration: Create Review Queue Table
-- This table stores items flagged for human review

CREATE TABLE IF NOT EXISTS bl_review_queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ai_result_id INT NOT NULL,
  matter_id VARCHAR(255),
  reviewed BOOLEAN DEFAULT FALSE,
  review_notes TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,

  -- Foreign key constraint
  FOREIGN KEY (ai_result_id) REFERENCES bl_ai_generate_result(id) ON DELETE CASCADE,

  -- Indexes for performance
  INDEX idx_ai_result_id (ai_result_id),
  INDEX idx_reviewed (reviewed),
  INDEX idx_added_at (added_at),
  INDEX idx_matter_id (matter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Run this migration manually in your MySQL database
-- Example: mysql -u username -p database_name < src/migrations/create_review_queue.sql
