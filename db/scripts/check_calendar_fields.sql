-- Check for calendar integration fields across all relevant tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name IN ('project_milestones', 'maintenance_work_orders', 'contact_interactions', 'time_entries')
    AND column_name IN ('calendar_sync_enabled', 'calendar_event_id')
ORDER BY
    table_name, column_name;
