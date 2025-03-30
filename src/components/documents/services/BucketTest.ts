
import { supabase } from '@/integrations/supabase/client';

interface BucketTestResult {
  success: boolean;
  bucketId?: string;
  bucketName?: string;
  error?: any;
}

export const testBucketAccess = async (): Promise<BucketTestResult> => {
  try {
    console.log('Testing access to storage buckets...');
    
    // First check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      
      // Even with an error, we can still attempt to use the known bucket
      console.log('Available buckets:', buckets || []);
      console.log('Target bucket not found in list, but will attempt uploads anyway');
      console.log('Note: The construction_documents bucket should be created via SQL migration');
      
      // Try to list files in the expected bucket anyway
      try {
        const { data: files, error: filesError } = await supabase
          .storage
          .from('construction_documents')
          .list();
          
        if (!filesError) {
          console.log('✅ Successfully connected to bucket: construction_documents');
          return {
            success: true,
            bucketId: 'construction_documents',
            bucketName: 'construction_documents'
          };
        }
      } catch (innerError) {
        // Ignore this error - we'll return the original error below
      }
      
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
      // Even though the bucket wasn't found in the list, it might still exist
      // Let's try to list files in it anyway
      
      try {
        const { data: files, error: filesError } = await supabase
          .storage
          .from('construction_documents')
          .list();
          
        if (!filesError) {
          console.log('✅ Successfully connected to bucket: construction_documents');
          return {
            success: true,
            bucketId: 'construction_documents',
            bucketName: 'construction_documents'
          };
        }
      } catch (innerError) {
        // Ignore this error
      }
      
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
    console.log('✅ Successfully connected to bucket:', constructionBucket.id);
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
