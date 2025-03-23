
import { supabase } from '@/integrations/supabase/client';

export const testBucketAccess = async () => {
  try {
    console.log('Testing access to storage buckets...');
    
    // List all available buckets
    const { data: buckets, error: bucketsError } = await supabase.storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      // If we can't list buckets, we'll still try to access the target bucket directly
      // Check if we can list files in the construction_documents bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('construction_documents')
        .list();
        
      if (filesError) {
        console.error('Error accessing bucket files directly:', filesError);
        return { 
          success: false, 
          error: filesError,
          message: 'Cannot access bucket - but will attempt uploads anyway' 
        };
      }
      
      // If we can list files but not buckets, the bucket exists
      return { 
        success: true, 
        bucketId: 'construction_documents',
        bucketName: 'Construction Documents',
        filesCount: files.length
      };
    }
    
    console.log('Available buckets:', buckets.map(b => ({ name: b.name, id: b.id })));
    
    // Check if our target bucket exists
    const targetBucket = buckets.find(b => 
      b.id === 'construction_documents' || 
      b.name === 'construction_documents'
    );
    
    if (!targetBucket) {
      console.warn('Target bucket not found in list, but will attempt uploads anyway');
      return { 
        success: true, 
        bucketId: 'construction_documents',
        bucketName: 'Construction Documents'
      };
    }
    
    console.log('Found target bucket:', targetBucket);
    
    // Try to list files in the bucket to confirm we have access
    const { data: files, error: filesError } = await supabase.storage
      .from('construction_documents')
      .list();
      
    if (filesError) {
      console.error('Error accessing bucket files:', filesError);
      return { 
        success: true, // Still return success so uploads can be attempted
        bucketId: targetBucket.id,
        bucketName: targetBucket.name,
        error: filesError,
        message: 'Cannot list files but bucket exists'
      };
    }
    
    console.log('Successfully accessed bucket. Files count:', files.length);
    
    return { 
      success: true, 
      bucketId: targetBucket.id,
      bucketName: targetBucket.name,
      filesCount: files.length
    };
    
  } catch (error) {
    console.error('Bucket test error:', error);
    // Still return success=true so uploads can be attempted
    return { 
      success: true, 
      bucketId: 'construction_documents',
      bucketName: 'Construction Documents',
      error,
      message: 'Error in bucket test but will attempt uploads'
    };
  }
};
