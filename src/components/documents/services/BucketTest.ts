
import { supabase } from '@/integrations/supabase/client';
import { DOCUMENTS_BUCKET_ID } from '@/constants/storageConstants';

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
    // Get the list of buckets to check if our documents bucket exists
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
    console.log('Available buckets:', buckets?.map(b => b.name));
    
    // Find our documents bucket (case-insensitive for compatibility)
    const documentsBucket = buckets?.find(bucket => 
      bucket.name.toLowerCase() === DOCUMENTS_BUCKET_ID.toLowerCase()
    );
    
    if (!documentsBucket) {
      console.error(`${DOCUMENTS_BUCKET_ID} bucket not found. Available buckets:`, buckets?.map(b => b.name));
      return { 
        success: false, 
        error: `${DOCUMENTS_BUCKET_ID} bucket not found` 
      };
    }
    
    console.log('Found bucket:', documentsBucket.name);
    
    return {
      success: true,
      bucketId: documentsBucket.id,
      bucketName: documentsBucket.name
    };
    
  } catch (error) {
    console.error('Error testing bucket access:', error);
    return {
      success: false,
      error
    };
  }
};
