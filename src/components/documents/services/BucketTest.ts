
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';

interface BucketTestResult {
  success: boolean;
  bucketId?: string;
  bucketName?: string;
  error?: any;
}

/**
 * Tests access to the storage bucket
 * This helps validate that the storage bucket is properly configured
 */
export const testBucketAccess = async (): Promise<BucketTestResult> => {
  try {
    // Simply try to list files in the known bucket instead of listing buckets
    const { data, error } = await supabase
      .storage
      .from(DOCUMENTS_BUCKET_ID)
      .list();
      
    if (error) {
      console.error(`Error accessing files in ${DOCUMENTS_BUCKET_ID} bucket:`, error);
      return {
        success: false,
        bucketId: DOCUMENTS_BUCKET_ID,
        bucketName: DOCUMENTS_BUCKET_ID,
        error: `Cannot access files: ${error.message}`
      };
    }
    
    console.log(`Successfully accessed ${DOCUMENTS_BUCKET_ID} bucket with ${data?.length || 0} files`);
    
    return {
      success: true,
      bucketId: DOCUMENTS_BUCKET_ID,
      bucketName: DOCUMENTS_BUCKET_ID
    };
  } catch (error) {
    console.error('Unexpected error testing bucket access:', error);
    return {
      success: false,
      error
    };
  }
};
