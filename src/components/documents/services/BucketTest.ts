
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
    console.log('Available buckets:', buckets?.map(b => b.name));
    
    if (!buckets || buckets.length === 0) {
      console.error('No storage buckets found in the project');
      return {
        success: false,
        error: 'No storage buckets available'
      };
    }
    
    // Try to find a bucket in this priority order:
    // 1. Exact match for "construction_documents"
    // 2. Case-insensitive match for "construction_documents"
    // 3. Contains both "construction" and "document" anywhere in the name
    let constructionBucket = buckets.find(bucket => bucket.name === 'construction_documents');
    
    if (!constructionBucket) {
      constructionBucket = buckets.find(bucket => 
        bucket.name.toLowerCase() === 'construction_documents'
      );
    }
    
    if (!constructionBucket) {
      constructionBucket = buckets.find(bucket => 
        bucket.name.toLowerCase().includes('construction') &&
        bucket.name.toLowerCase().includes('document')
      );
    }
    
    if (!constructionBucket) {
      // If we still haven't found a matching bucket, just use the first one as fallback
      constructionBucket = buckets[0];
      console.warn('Construction documents bucket not found. Using fallback bucket:', constructionBucket.name);
    } else {
      console.log('Found construction documents bucket:', constructionBucket.name);
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
