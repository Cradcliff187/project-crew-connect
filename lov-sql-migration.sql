
-- Create the construction_documents bucket if it doesn't exist
DO $$
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'construction_documents'
    ) THEN
        -- Create the bucket with appropriate settings
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('construction_documents', 'construction_documents', true);
        
        -- Create a policy to allow anonymous reads
        INSERT INTO storage.policies (name, definition, bucket_id)
        VALUES (
            'Public Read Access',
            '(bucket_id = ''construction_documents''::text)',
            'construction_documents'
        );
    END IF;
END $$;

-- Enable Row Level Security for materials table if not already enabled
ALTER TABLE IF EXISTS public.work_order_materials ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for materials if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'work_order_materials' 
        AND policyname = 'Universal access to work_order_materials'
    ) THEN
        -- Create a universal access policy (can be restricted later)
        CREATE POLICY "Universal access to work_order_materials" 
        ON public.work_order_materials 
        FOR ALL 
        USING (true);
    END IF;
END $$;
