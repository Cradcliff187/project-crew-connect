-- Add webhook triggers for additional tables
CREATE TRIGGER webhook_customers_change
AFTER INSERT OR UPDATE OR DELETE ON customers
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();

CREATE TRIGGER webhook_employees_change
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();

CREATE TRIGGER webhook_estimates_change
AFTER INSERT OR UPDATE OR DELETE ON estimates
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();

CREATE TRIGGER webhook_maintenance_work_orders_change
AFTER INSERT OR UPDATE OR DELETE ON maintenance_work_orders
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();

CREATE TRIGGER webhook_subcontractors_change
AFTER INSERT OR UPDATE OR DELETE ON subcontractors
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();

CREATE TRIGGER webhook_vendors_change
AFTER INSERT OR UPDATE OR DELETE ON vendors
FOR EACH ROW
EXECUTE FUNCTION notify_webhook_with_data();
