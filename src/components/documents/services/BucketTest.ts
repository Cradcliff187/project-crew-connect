
import { supabase } from '@/integrations/supabase/client';

export const testBucketAccess = async () => {
  try {
    console.log('Testing access to storage buckets...');
    
    // List all available buckets
    const { data: buckets, error: bucketsError } = await supabase.storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return { success: false, error: bucketsError };
    }
    
    console.log('Available buckets:', buckets.map(b => ({ name: b.name, id: b.id })));
    
    // Check if our target bucket exists
    const targetBucket = buckets.find(b => 
      b.id === 'construction_documents' || 
      b.name === 'construction_documents'
    );
    
    if (!targetBucket) {
      console.error('Target bucket not found! Available buckets:', buckets);
      return { 
        success: false, 
        error: new Error('Target bucket "construction_documents" not found') 
      };
    }
    
    console.log('Found target bucket:', targetBucket);
    
    // Try to list files in the bucket to confirm we have access
    const { data: files, error: filesError } = await supabase.storage
      .from(targetBucket.id)
      .list();
      
    if (filesError) {
      console.error('Error accessing bucket files:', filesError);
      return { success: false, error: filesError };
    }
    
    console.log('Successfully accessed bucket. Files:', files);
    
    return { 
      success: true, 
      bucketId: targetBucket.id,
      bucketName: targetBucket.name
    };
    
  } catch (error) {
    console.error('Bucket test error:', error);
    return { success: false, error };
  }
};
