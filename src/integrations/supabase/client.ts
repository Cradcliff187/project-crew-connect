
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zrxezqllmpdlhiudutme.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ";

// Create client with explicit headers to ensure API key is always sent
// But avoid setting Content-Type globally to prevent upload issues
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'apikey': SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
      },
    },
    db: {
      schema: 'public',
    },
    // Initialize storage settings with correct defaults
    storage: {
      // Don't limit the file sizes by default
      maxFileSize: 50 * 1024 * 1024, // 50MB max file size
    },
  }
);

// Store the bucket name in a constant to avoid typos and case sensitivity issues
export const DOCUMENTS_BUCKET_NAME = 'construction_documents';

// Helper to find the existing storage bucket with a consistent approach
export const findStorageBucket = async (targetName: string = DOCUMENTS_BUCKET_NAME) => {
  try {
    // Get all available buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return null;
    }
    
    // Log all available buckets for debugging
    console.log('Available storage buckets:', buckets?.map(b => b.name));
    
    // First try exact match (which should work now that we've created the bucket)
    let bucket = buckets?.find(b => b.name === targetName);
    
    if (bucket) {
      console.log(`Found storage bucket: ${bucket.name}`);
      return bucket;
    }
    
    // If we have any buckets at all, use the first one as a fallback
    if (buckets && buckets.length > 0) {
      console.warn(`Using fallback bucket: ${buckets[0].name} instead of ${targetName}`);
      return buckets[0];
    }
    
    console.warn(`No suitable storage bucket found`);
    return null;
  } catch (err) {
    console.error('Error in findStorageBucket:', err);
    return null;
  }
};

// Improved bucket initialization that doesn't try to create a bucket
// Just checks for existing buckets and provides clear messaging
export const ensureStorageBucket = async () => {
  try {
    const bucket = await findStorageBucket();
    
    if (bucket) {
      console.log(`Using existing bucket: ${bucket.name}`);
      return {
        success: true,
        bucketName: bucket.name
      };
    }
    
    console.warn('No storage bucket found');
    
    return {
      success: false,
      error: 'Storage bucket not found'
    };
  } catch (error) {
    console.error('Error in ensureStorageBucket:', error);
    return {
      success: false,
      error
    };
  }
};

// Check bucket status only once on initial load, not repeatedly
let bucketCheckComplete = false;

if (!bucketCheckComplete) {
  bucketCheckComplete = true;
  ensureStorageBucket().then(result => {
    if (result.success) {
      console.log('Storage system initialized successfully');
    } else {
      console.warn('Storage system initialization failed:', result.error);
      console.warn('Document uploads may not work correctly');
    }
  }).catch(console.error);
}
