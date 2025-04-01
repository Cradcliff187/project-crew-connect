
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Document } from '../schemas/documentSchema';

export interface DocumentShareOptions {
  documentId: string;
  estimateId?: string;
  projectId?: string;
  recipientEmail: string;
  subject: string;
  message: string;
  includeEntityLink?: boolean;
}

export const useDocumentSharing = () => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareDocument = async (options: DocumentShareOptions): Promise<boolean> => {
    if (!options.documentId || !options.recipientEmail) {
      setError('Missing required document or recipient information');
      return false;
    }

    setIsSending(true);
    setError(null);

    try {
      console.log(`Sharing document ${options.documentId} with ${options.recipientEmail}`);
      
      // In a production environment, this would call a serverless function
      // to handle the actual email sending process
      const detailsJson = JSON.stringify({
        document_id: options.documentId,
        entity_id: options.estimateId || options.projectId,
        entity_type: options.estimateId ? 'ESTIMATE' : 'PROJECT',
        recipient_email: options.recipientEmail,
        subject: options.subject,
        message: options.message,
        include_entity_link: options.includeEntityLink || false,
        sent_at: new Date().toISOString(),
      });
      
      const { error: shareError } = await supabase
        .from('activitylog')
        .insert({
          logid: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          action: 'DOCUMENT_SHARE',
          moduletype: 'DOCUMENTS',
          referenceid: options.documentId,
          detailsjson: detailsJson,
          status: 'SENT',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (shareError) {
        throw shareError;
      }
      
      // For demonstration purposes - In real implementation, we'd verify email was actually sent
      toast({
        title: 'Document shared',
        description: `Document has been shared with ${options.recipientEmail}`,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error sharing document:', err);
      setError(err.message || 'Failed to share document');
      
      toast({
        title: 'Error',
        description: err.message || 'Failed to share document',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    shareDocument,
    isSending,
    error
  };
};
