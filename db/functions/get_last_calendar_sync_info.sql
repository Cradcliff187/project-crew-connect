-- Function to get the last calendar sync information
-- Returns the last sync time for a given calendar_id
CREATE OR REPLACE FUNCTION get_last_calendar_sync_info(p_calendar_id TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  v_last_sync_time TIMESTAMP WITH TIME ZONE;
  v_channel_info JSONB;
BEGIN
  -- Get last sync time for the calendar
  SELECT last_sync_time INTO v_last_sync_time
  FROM sync_cursors
  WHERE calendar_id = COALESCE(p_calendar_id, 'primary')
  ORDER BY last_sync_time DESC
  LIMIT 1;

  -- Get channel information
  SELECT
    jsonb_build_object(
      'id', id,
      'calendar_id', calendar_id,
      'resource_id', resource_id,
      'expiration', expiration,
      'created_at', created_at
    ) INTO v_channel_info
  FROM push_notification_channels
  WHERE calendar_id = COALESCE(p_calendar_id, 'primary')
  ORDER BY expiration DESC
  LIMIT 1;

  -- Build result
  result := jsonb_build_object(
    'calendar_id', COALESCE(p_calendar_id, 'primary'),
    'last_sync_time', v_last_sync_time,
    'channel_info', v_channel_info,
    'is_synced', v_last_sync_time IS NOT NULL
  );

  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  RETURN jsonb_build_object(
    'status', 'error',
    'message', SQLERRM,
    'calendar_id', COALESCE(p_calendar_id, 'primary')
  );
END;
$$;
