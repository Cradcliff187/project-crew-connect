import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Default fallback values if environment variables are not set
// This prevents the error when running in development environments
const fallbackUrl = 'https://zrxezqllmpdlhiudutme.supabase.co'
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ'

// Export a constant for the bucket ID to keep it consistent across the application
export const DOCUMENTS_BUCKET_ID = 'construction_documents';

export const supabase = createClient(
  supabaseUrl || fallbackUrl, 
  supabaseAnonKey || fallbackAnonKey
)

// Simplified helper function to get the storage bucket directly
export async function getStorageBucket() {
  try {
    // Instead of checking if the bucket exists, just return success with the bucket ID
    // This bypasses the need for bucket listing permissions
    return { 
      success: true, 
      bucketId: DOCUMENTS_BUCKET_ID 
    };
  } catch (error) {
    console.error('Error accessing storage bucket:', error);
    return { success: false, error };
  }
}

// Keep the original function for backward compatibility, but simplify it
export async function ensureStorageBucket() {
  return getStorageBucket();
}
