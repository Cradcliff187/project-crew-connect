
import { Document } from '../schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Helper functions for document handling
 */

// Download a document
export const downloadDocument = async (document: Document) => {
  if (!document || !document.storage_path) {
    toast({
      title: 'Download failed',
      description: 'Invalid document data',
      variant: 'destructive'
    });
    return;
  }
  
  try {
    // Use Supabase public URL if available
    if (document.url) {
      // Create a temporary anchor element
      const a = window.document.createElement('a');
      a.href = document.url;
      a.download = document.file_name;
      a.target = '_blank';
      
      // Append to the document, click, and remove
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      return;
    }
    
    // Fall back to downloading through Supabase storage
    const { data, error } = await supabase
      .storage
      .from('construction_documents')
      .download(document.storage_path);
    
    if (error) throw error;
    
    // Create a download link
    const url = URL.createObjectURL(data);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = document.file_name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error: any) {
    console.error('Download error:', error);
    toast({
      title: 'Download failed',
      description: error.message || 'Failed to download the file',
      variant: 'destructive'
    });
  }
};

// Open document in a new tab
export const openDocumentInNewTab = (document: Document) => {
  if (!document.url) {
    // Try to get a public URL if we don't have one
    supabase
      .storage
      .from('construction_documents')
      .getPublicUrl(document.storage_path)
      .then(({ data }) => {
        if (data?.publicUrl) {
          window.open(data.publicUrl, '_blank');
        } else {
          toast({
            title: 'Error',
            description: 'Could not get document URL',
            variant: 'destructive'
          });
        }
      })
      .catch(error => {
        console.error('Error getting public URL:', error);
        toast({
          title: 'Error',
          description: 'Could not open document',
          variant: 'destructive'
        });
      });
    return;
  }
  
  window.open(document.url, '_blank');
};

// Format file size for display
export const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
