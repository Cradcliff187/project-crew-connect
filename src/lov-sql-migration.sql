
-- Create a storage bucket for construction documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'construction_documents', 'Construction Documents', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'construction_documents');

-- Create RLS policies to allow public access to the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'construction_documents');

CREATE POLICY "Insert Access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'construction_documents');

CREATE POLICY "Update Access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'construction_documents');

CREATE POLICY "Delete Access"
ON storage.objects FOR DELETE
USING (bucket_id = 'construction_documents');
