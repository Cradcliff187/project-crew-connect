
import { supabase } from '@/integrations/supabase/client';

interface BucketTestResult {
  success: boolean;
  bucketId?: string;
  bucketName?: string;
  error?: any;
}

/**
 * Tests access to the storage bucket
 * This is helpful to validate that the storage bucket is properly configured
 */
export const testBucketAccess = async (): Promise<BucketTestResult> => {
  try {
    // Get the list of buckets to check if construction_documents exists
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
    
    // Find construction_documents bucket - using case-insensitive matching
    const constructionBucket = buckets.find(bucket => 
      bucket.name.toLowerCase() === 'construction_documents'.toLowerCase()
    );
    
    if (!constructionBucket) {
      console.error('construction_documents bucket not found');
      return { 
        success: false, 
        error: 'construction_documents bucket not found' 
      };
    }
    
    return {
      success: true,
      bucketId: constructionBucket.id,
      bucketName: constructionBucket.name
    };
    
  } catch (error) {
    console.error('Error testing bucket access:', error);
    return {
      success: false,
      error
    };
  }
};
