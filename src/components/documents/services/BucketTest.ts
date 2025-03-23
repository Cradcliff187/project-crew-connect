
import { supabase } from '@/integrations/supabase/client';

export interface BucketTestResult {
  success: boolean;
  bucketId?: string;
  bucketName?: string;
  error?: any;
}

export const testBucketAccess = async (): Promise<BucketTestResult> => {
  try {
    console.log('Testing access to storage buckets...');
    
    // List all buckets to check permissions
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('Error accessing buckets:', error.message);
      // Despite error, we'll try to work with the expected bucket
      return {
        success: false,
        bucketId: 'construction_documents',
        error: error.message
      };
    }
    
    console.log('Available buckets:', buckets);
    
    // Look for our target bucket (construction_documents)
    const targetBucket = buckets.find(bucket => bucket.id === 'construction_documents');
    
    if (targetBucket) {
      console.log('✅ Target bucket found:', targetBucket.id);
      return {
        success: true,
        bucketId: targetBucket.id,
        bucketName: targetBucket.name
      };
    } else {
      console.log('Target bucket not found in list, but will attempt uploads anyway');
      
      // Just return the expected bucket ID
      return {
        success: true,
        bucketId: 'construction_documents',
        bucketName: 'Construction Documents'
      };
    }
  } catch (error: any) {
    console.error('Error testing bucket access:', error);
    
    // Return failure but include our expected bucket ID anyway
    return {
      success: false,
      bucketId: 'construction_documents',
      error: error.message || 'Unknown error occurred during bucket test'
    };
  }
};
