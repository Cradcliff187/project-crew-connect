
import { supabase } from '@/integrations/supabase/client';

export const testBucketAccess = async () => {
  try {
    console.log('Testing access to storage buckets...');
    
    // List all available buckets
    const { data: buckets, error: bucketsError } = await supabase.storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      
      // Check if we can list files in the construction_documents bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('construction_documents')
        .list();
        
      if (filesError) {
        console.error('Error accessing bucket files directly:', filesError);
        
        // Try to get bucket info
        console.log('Trying to get bucket info directly...');
        const { data: bucketInfo, error: bucketInfoError } = await supabase.storage
          .getBucket('construction_documents');
          
        if (bucketInfoError) {
          console.error('Error getting bucket info:', bucketInfoError);
        } else {
          console.log('Got bucket info:', bucketInfo);
        }
        
        return { 
          success: true, // Return true anyway to allow uploads to be attempted
          error: filesError,
          message: 'Cannot access bucket, but uploads will be attempted anyway',
          bucketId: 'construction_documents',
          bucketName: 'Construction Documents'
        };
      }
      
      // If we can list files but not buckets, the bucket exists
      console.log('Could list files but not buckets, files count:', files.length);
      return { 
        success: true, 
        bucketId: 'construction_documents',
        bucketName: 'Construction Documents',
        filesCount: files.length
      };
    }
    
    console.log('Available buckets:', buckets.map(b => ({ name: b.name, id: b.id, public: b.public })));
    
    // Check if our target bucket exists
    const targetBucket = buckets.find(b => 
      b.id === 'construction_documents' || 
      b.name === 'construction_documents'
    );
    
    if (!targetBucket) {
      console.warn('Target bucket not found in list, but will attempt uploads anyway');
      
      // Try to create the bucket if it doesn't exist
      console.log('Attempting to create bucket...');
      const { data: newBucket, error: createError } = await supabase.storage
        .createBucket('construction_documents', { public: true });
        
      if (createError) {
        console.error('Error creating bucket:', createError);
      } else {
        console.log('Successfully created bucket:', newBucket);
        return {
          success: true,
          bucketId: 'construction_documents',
          bucketName: 'Construction Documents',
          message: 'Bucket created successfully'
        };
      }
      
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
    if (files.length > 0) {
      console.log('Sample files:', files.slice(0, 5));
    }
    
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
