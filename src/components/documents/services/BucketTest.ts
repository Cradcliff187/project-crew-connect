
import { supabase } from '@/integrations/supabase/client';

interface BucketTestResult {
  success: boolean;
  bucketId?: string;
  bucketName?: string;
  error?: any;
}

export const testBucketAccess = async (): Promise<BucketTestResult> => {
  try {
    // First check if the bucket exists
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
    
    // Find our construction documents bucket
    const constructionBucket = buckets.find(bucket => 
      bucket.name === 'construction_documents'
    );
    
    if (!constructionBucket) {
      console.warn('Bucket "construction_documents" not found');
      return {
        success: false,
        error: new Error('Bucket "construction_documents" not found')
      };
    }
    
    // Try to list files in the bucket
    const { data: files, error: filesError } = await supabase
      .storage
      .from('construction_documents')
      .list();
    
    if (filesError) {
      console.error('Error listing files in bucket:', filesError);
      return {
        success: false,
        error: filesError
      };
    }
    
    // Success! The bucket exists and we can list files
    return {
      success: true,
      bucketId: constructionBucket.id,
      bucketName: 'construction_documents'
    };
    
  } catch (error) {
    console.error('Unexpected error testing bucket access:', error);
    return {
      success: false,
      error
    };
  }
};
