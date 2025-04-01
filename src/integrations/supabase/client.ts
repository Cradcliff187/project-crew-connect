import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const DOCUMENTS_BUCKET_ID = 'construction_documents';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to ensure the documents storage bucket exists
export async function ensureStorageBucket() {
  try {
    // First check if the bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();
      
    if (listError) {
      console.error('Error checking storage buckets:', listError);
      return { success: false, error: listError };
    }
    
    // If the bucket already exists, return success
    if (buckets?.some(bucket => bucket.name === DOCUMENTS_BUCKET_ID)) {
      console.log(`Bucket ${DOCUMENTS_BUCKET_ID} already exists`);
      return { success: true };
    }
    
    // Otherwise, create the bucket
    const { error: createError } = await supabase
      .storage
      .createBucket(DOCUMENTS_BUCKET_ID, {
        public: false,
        fileSizeLimit: 50 * 1024 * 1024 // 50MB limit
      });
      
    if (createError) {
      console.error('Error creating storage bucket:', createError);
      return { success: false, error: createError };
    }
    
    console.log(`Successfully created bucket ${DOCUMENTS_BUCKET_ID}`);
    return { success: true };
  } catch (error) {
    console.error('Unexpected error ensuring storage bucket:', error);
    return { success: false, error };
  }
}
