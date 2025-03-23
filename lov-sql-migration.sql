
-- Create a function to update work order status without triggering activitylog insertion
CREATE OR REPLACE FUNCTION public.update_work_order_status_bypass_log(
  p_work_order_id UUID, 
  p_status TEXT
) 
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- Update the status directly
  UPDATE public.maintenance_work_orders
  SET 
    status = p_status,
    updated_at = NOW()
  WHERE work_order_id = p_work_order_id;

  -- Return success if the row was updated
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to public
GRANT EXECUTE ON FUNCTION public.update_work_order_status_bypass_log TO PUBLIC;
