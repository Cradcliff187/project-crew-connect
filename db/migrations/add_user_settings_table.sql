-- Create the user_settings table for storing user preferences including calendar settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies for the user_settings table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own settings
CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own settings
CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to update the updated_at timestamp on update
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
