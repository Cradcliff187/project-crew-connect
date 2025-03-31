
import { supabase } from '@/integrations/supabase/client';

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
    // Get the list of buckets to check for available storage buckets
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return { 
        success: false, 
        error: bucketsError 
      };
    }
    
    // Log all available buckets to help with debugging
    console.log('Available buckets:', buckets?.map(b => `${b.id} (${b.name})`));
    
    if (!buckets || buckets.length === 0) {
      console.error('No storage buckets found in the project');
      return {
        success: false,
        error: 'No storage buckets available'
      };
    }
    
    // Look specifically for the construction_documents bucket by ID (not name)
    // This is more reliable than matching by name which can have case sensitivity issues
    const constructionBucket = buckets.find(bucket => bucket.id === 'construction_documents');
    
    if (constructionBucket) {
      console.log('Found construction documents bucket:', constructionBucket.id);
      return {
        success: true,
        bucketId: constructionBucket.id,
        bucketName: constructionBucket.name
      };
    }
    
    // If we still don't find the expected bucket, just use the first one as fallback
    // but provide a clear warning
    const fallbackBucket = buckets[0];
    console.warn(
      'Construction documents bucket not found. Using fallback bucket:', 
      fallbackBucket.id,
      '- Please create a bucket with ID "construction_documents" in Supabase.'
    );
    
    return {
      success: true,
      bucketId: fallbackBucket.id,
      bucketName: fallbackBucket.name
    };
    
  } catch (error) {
    console.error('Error testing bucket access:', error);
    return {
      success: false,
      error
    };
  }
};
