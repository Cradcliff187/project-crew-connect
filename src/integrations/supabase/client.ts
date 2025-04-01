import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Default fallback values if environment variables are not set
// This prevents the error when running in development environments
const fallbackUrl = 'https://zrxezqllmpdlhiudutme.supabase.co'
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ'

export const DOCUMENTS_BUCKET_ID = 'construction_documents';

export const supabase = createClient(
  supabaseUrl || fallbackUrl, 
  supabaseAnonKey || fallbackAnonKey
)

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
    
    // Debug: log all buckets to help diagnose issues
    console.log('Available buckets:', 
      buckets?.map(b => `ID: ${b.id}, Name: ${b.name}, Public: ${b.public}`));
    
    // If the bucket already exists, return success
    if (buckets?.some(bucket => bucket.id === DOCUMENTS_BUCKET_ID)) {
      console.log(`Bucket ${DOCUMENTS_BUCKET_ID} already exists`);
      return { success: true, bucketId: DOCUMENTS_BUCKET_ID };
    }
    
    // If no buckets found at all, that's a separate issue to report
    if (!buckets || buckets.length === 0) {
      console.error('No storage buckets found in Supabase project');
      return { 
        success: false, 
        error: 'No storage buckets available. Please check Supabase configuration.'
      };
    }
    
    // Otherwise, report that the specific bucket we need doesn't exist
    console.error(`Bucket ${DOCUMENTS_BUCKET_ID} not found. Available buckets: ${buckets.map(b => b.id).join(', ')}`);
    return { 
      success: false, 
      error: `Required bucket "${DOCUMENTS_BUCKET_ID}" not found in Supabase storage.` 
    };
  } catch (error) {
    console.error('Unexpected error ensuring storage bucket:', error);
    return { success: false, error };
  }
}
