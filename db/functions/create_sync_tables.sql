-- Create tables for calendar sync if they don't exist

-- Table to track the last sync time for each calendar
CREATE TABLE IF NOT EXISTS sync_cursors (
  calendar_id TEXT PRIMARY KEY,
  last_sync_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track webhook notification channels
CREATE TABLE IF NOT EXISTS push_notification_channels (
  id TEXT PRIMARY KEY,
  calendar_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  expiration TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add initial primary calendar entry if it doesn't exist
INSERT INTO sync_cursors (calendar_id, last_sync_time)
VALUES ('primary', now())
ON CONFLICT (calendar_id) DO NOTHING;
