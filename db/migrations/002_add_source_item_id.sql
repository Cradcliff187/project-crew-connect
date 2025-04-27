-- Migration: 002_add_source_item_id.sql
-- Purpose: Add source_item_id column to estimate_items table for tracking item lineage across revisions

-- Add the column to track source items
ALTER TABLE estimate_items ADD COLUMN IF NOT EXISTS source_item_id TEXT;

-- Add comment explaining the purpose
COMMENT ON COLUMN estimate_items.source_item_id IS 'References the original item ID this item was copied from, used for tracking history across revisions';

-- Create an index to speed up lookups by source item
CREATE INDEX IF NOT EXISTS idx_estimate_items_source_item_id ON estimate_items(source_item_id);

-- Migration complete message
DO $$
BEGIN
    RAISE NOTICE 'Migration 002_add_source_item_id completed successfully';
END $$;
