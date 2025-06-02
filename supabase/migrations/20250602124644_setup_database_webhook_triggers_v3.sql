-- Create enhanced webhook notification function
CREATE OR REPLACE FUNCTION notify_webhook_with_data()
RETURNS TRIGGER AS $$
DECLARE
    table_name TEXT := TG_TABLE_NAME;
    operation TEXT := TG_OP;
    record_data JSONB;
    old_record_data JSONB;
    payload JSONB;
    headers JSONB;
BEGIN
    -- Prepare the record data based on operation type
    IF operation = 'DELETE' THEN
        record_data := to_jsonb(OLD);
        old_record_data := NULL;
    ELSIF operation = 'UPDATE' THEN
        record_data := to_jsonb(NEW);
        old_record_data := to_jsonb(OLD);
    ELSE -- INSERT
        record_data := to_jsonb(NEW);
        old_record_data := NULL;
    END IF;

    -- Build the payload
    payload := jsonb_build_object(
        'type', operation,
        'table', table_name,
        'schema', 'public',
        'record', record_data,
        'old_record', old_record_data,
        'timestamp', extract(epoch from now())
    );

    -- Set headers
    headers := '{"Content-Type": "application/json"}'::jsonb;

    -- Call the webhook with proper parameter types
    PERFORM supabase_functions.http_request(
        'https://zrxezqllmpdlhiudutme.supabase.co/functions/v1/database-change-handler'::text,
        'POST'::text,
        headers,
        payload,
        5000::integer
    );

    -- Return the appropriate record
    IF operation = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the original operation
    RAISE WARNING 'Webhook notification failed: %', SQLERRM;
    IF operation = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create webhook triggers for core tables
CREATE TRIGGER webhook_projects_change
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();

CREATE TRIGGER webhook_time_entries_change
AFTER INSERT OR UPDATE OR DELETE ON time_entries
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();

CREATE TRIGGER webhook_expenses_change
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();

CREATE TRIGGER webhook_project_budget_items_change
AFTER INSERT OR UPDATE OR DELETE ON project_budget_items
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();

CREATE TRIGGER webhook_change_orders_change
AFTER INSERT OR UPDATE OR DELETE ON change_orders
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();

CREATE TRIGGER webhook_receipts_change
AFTER INSERT OR UPDATE OR DELETE ON receipts
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();
