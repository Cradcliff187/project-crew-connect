
import { Document } from '../schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';

// Helper function to get the file extension from a file name
export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  if (parts.length === 1) return '';
  return `.${parts[parts.length - 1].toLowerCase()}`;
};

// Helper function to get the mime type from a file extension
export const getMimeTypeFromExtension = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

// Helper function to download a document
export const downloadDocument = async (document: Document): Promise<void> => {
  if (!document.document_id || !document.storage_path) {
    console.error('Cannot download document: missing document_id or storage_path');
    return;
  }

  try {
    // Get the public URL for the document
    const { data } = await supabase
      .storage
      .from('construction_documents')
      .getPublicUrl(document.storage_path);

    // Create an invisible link and trigger the download
    const url = data?.publicUrl || '';
    const linkId = document.document_id ? document.document_id : 'download';
    
    // Check if we're in a browser environment before manipulating the DOM
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Create a temporary anchor element for download
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name || 'document';
      
      // Append to body, click and remove
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } else {
      console.error('Cannot download document: not in browser environment');
    }
  } catch (error) {
    console.error('Error downloading document:', error);
  }
};

// Helper function to open a document in a new tab
export const openDocumentInNewTab = async (document: Document): Promise<void> => {
  if (!document.document_id || !document.storage_path) {
    console.error('Cannot open document: missing document_id or storage_path');
    return;
  }

  try {
    // Get the public URL for the document
    const { data } = await supabase
      .storage
      .from('construction_documents')
      .getPublicUrl(document.storage_path);

    // Open in a new tab
    if (typeof window !== 'undefined') {
      window.open(data?.publicUrl || '', '_blank');
    } else {
      console.error('Cannot open document: not in browser environment');
    }
  } catch (error) {
    console.error('Error opening document:', error);
  }
};

// Fix for DocumentUtils then issue
export const getPublicUrl = async (path: string): Promise<string> => {
  try {
    const response = await supabase
      .storage
      .from('construction_documents')
      .getPublicUrl(path);
    
    return response.data.publicUrl;
  } catch (error) {
    console.error('Error getting public URL:', error);
    return '';
  }
};
