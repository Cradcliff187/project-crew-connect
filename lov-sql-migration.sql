
-- Add payment terms, tax_id, and notes to vendors table if they don't exist
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR DEFAULT 'NET30',
ADD COLUMN IF NOT EXISTS tax_id VARCHAR,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Enable replica identity for real-time updates if not already enabled
ALTER TABLE public.vendors REPLICA IDENTITY FULL;

-- Add table to realtime publication if not already added
SELECT CASE 
  WHEN NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'vendors'
  ) 
  THEN pg_catalog.pg_publication_add_table(
    'supabase_realtime'::pg_catalog.text,
    'vendors'::regclass
  )::text
  ELSE 'Table already in realtime publication'::text
END;
