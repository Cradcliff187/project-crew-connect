
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
    
    // Detailed logging of all buckets
    console.log('Available buckets:', 
      buckets?.map(b => `ID: ${b.id}, Name: ${b.name}, Public: ${b.public}`));
    
    if (!buckets || buckets.length === 0) {
      console.error('No storage buckets found in the project');
      return {
        success: false,
        error: 'No storage buckets available'
      };
    }
    
    // Search for construction documents bucket with different variations
    const constructionBucket = buckets.find(
      bucket => 
        bucket.id === 'construction_documents' || 
        bucket.name === 'Construction Documents' ||
        bucket.name === 'construction_documents'
    );
    
    if (constructionBucket) {
      console.log('Found construction documents bucket:', {
        id: constructionBucket.id,
        name: constructionBucket.name,
        isPublic: constructionBucket.public
      });
      
      return {
        success: true,
        bucketId: constructionBucket.id,
        bucketName: constructionBucket.name
      };
    }
    
    // If we don't find the exact bucket, provide more context
    console.warn(
      'Specific construction documents bucket not found. ' + 
      'Available buckets:', 
      buckets.map(b => `${b.id} (${b.name})`)
    );
    
    return {
      success: false,
      error: 'Construction documents bucket not found'
    };
    
  } catch (error) {
    console.error('Unexpected error testing bucket access:', error);
    return {
      success: false,
      error
    };
  }
};

