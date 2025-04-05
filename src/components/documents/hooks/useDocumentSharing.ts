
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ShareDocumentParams {
  documentId: string;
  recipientEmail: string;
  subject: string;
  message: string;
  includeEntityLink?: boolean;
  includeBranding?: boolean;
  entityId?: string;
  entityType?: string;
}

export function useDocumentSharing() {
  const [isSending, setIsSending] = useState(false);
  
  const shareDocument = async ({
    documentId,
    recipientEmail,
    subject,
    message,
    includeEntityLink = false,
    includeBranding = true,
    entityId,
    entityType
  }: ShareDocumentParams): Promise<boolean> => {
    setIsSending(true);
    
    try {
      // First get the document information
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
      
      if (docError) throw new Error(`Error fetching document: ${docError.message}`);
      if (!docData) throw new Error('Document not found');
      
      // Get the document URL
      const { data: urlData } = await supabase
        .storage
        .from('construction_documents')
        .getPublicUrl(docData.storage_path);
      
      if (!urlData.publicUrl) throw new Error('Could not generate document URL');
      
      // Send the email with document attachment
      // Note: In a real implementation, we would call a Supabase Edge Function to send the email
      // For this example, we'll simulate the email sending
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the sharing action
      const { error: logError } = await supabase
        .from('document_access_logs')
        .insert({
          document_id: documentId,
          action: 'SHARE',
          accessed_by: recipientEmail
        });
      
      if (logError) console.error('Error logging share action:', logError);
      
      toast({
        title: 'Document Shared',
        description: `Document has been sent to ${recipientEmail}`,
        className: 'bg-[#0485ea] text-white',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error sharing document:', error);
      toast({
        title: 'Sharing Failed',
        description: error.message || 'There was an error sharing the document',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };
  
  return { shareDocument, isSending };
}
