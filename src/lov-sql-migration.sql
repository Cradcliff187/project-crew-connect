
-- Create vendor_status_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vendor_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendorid TEXT NOT NULL REFERENCES vendors(vendorid),
    status TEXT NOT NULL,
    previous_status TEXT,
    changed_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    changed_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_vendor_status_history_vendorid ON public.vendor_status_history(vendorid);
CREATE INDEX IF NOT EXISTS idx_vendor_status_history_status ON public.vendor_status_history(status);

-- Enable row level security
ALTER TABLE public.vendor_status_history ENABLE ROW LEVEL SECURITY;

-- Create a basic policy that allows all operations (can be refined later)
CREATE POLICY vendor_status_history_policy ON public.vendor_status_history 
  FOR ALL USING (true);

-- Create a trigger function to automatically record vendor status changes
CREATE OR REPLACE FUNCTION public.record_vendor_status_change() 
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.vendor_status_history (
      vendorid, 
      status, 
      previous_status, 
      changed_date,
      notes
    ) VALUES (
      NEW.vendorid,
      NEW.status,
      OLD.status,
      NOW(),
      'Automatic status change record'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger on the vendors table
DROP TRIGGER IF EXISTS vendor_status_change_trigger ON public.vendors;
CREATE TRIGGER vendor_status_change_trigger
AFTER UPDATE ON public.vendors
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.record_vendor_status_change();
