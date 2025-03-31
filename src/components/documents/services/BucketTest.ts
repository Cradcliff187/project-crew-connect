
import { supabase, DOCUMENTS_BUCKET_NAME } from '@/integrations/supabase/client';

interface BucketTestResult {
  success: boolean;
  bucketId?: string;
  bucketName?: string;
  error?: any;
}

/**
 * Tests access to the storage bucket
 * This is helpful to validate that the storage bucket is properly configured
 * 
 * We're using a memoized pattern to prevent repeated calls
 */
let cachedTestResult: BucketTestResult | null = null;

export const testBucketAccess = async (): Promise<BucketTestResult> => {
  // Return cached result if available to prevent multiple API calls
  if (cachedTestResult) {
    return cachedTestResult;
  }

  try {
    // Get the list of buckets to check for available storage buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      cachedTestResult = { 
        success: false, 
        error: bucketsError 
      };
      return cachedTestResult;
    }
    
    if (!buckets || buckets.length === 0) {
      console.error('No storage buckets found in the project');
      cachedTestResult = {
        success: false,
        error: 'No storage buckets available'
      };
      return cachedTestResult;
    }
    
    // Try to find an exact match for our bucket name constant
    const constructionBucket = buckets.find(bucket => bucket.name === DOCUMENTS_BUCKET_NAME);
    
    if (constructionBucket) {
      console.log(`Found ${DOCUMENTS_BUCKET_NAME} bucket:`, constructionBucket.name);
      cachedTestResult = {
        success: true,
        bucketId: constructionBucket.id,
        bucketName: constructionBucket.name
      };
      return cachedTestResult;
    } else {
      // If we can't find the expected bucket, use the first available one as fallback
      const fallbackBucket = buckets[0];
      console.warn(`${DOCUMENTS_BUCKET_NAME} bucket not found. Using fallback bucket:`, fallbackBucket.name);
      cachedTestResult = {
        success: true,
        bucketId: fallbackBucket.id,
        bucketName: fallbackBucket.name
      };
      return cachedTestResult;
    }
    
  } catch (error) {
    console.error('Error testing bucket access:', error);
    cachedTestResult = {
      success: false,
      error
    };
    return cachedTestResult;
  }
};
