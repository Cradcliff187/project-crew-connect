-- Create user_settings table for storing application and user settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert global settings record with a fixed UUID
INSERT INTO user_settings (user_id, settings)
VALUES ('00000000-0000-0000-0000-000000000000', '{}'::jsonb)
ON CONFLICT (user_id) DO NOTHING;

-- Add RLS policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own settings and global settings
CREATE POLICY "Users can read their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

-- Allow users to update only their own settings
CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to insert their own settings
CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
