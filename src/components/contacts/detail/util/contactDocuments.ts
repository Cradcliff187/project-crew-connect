
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Document, EntityType } from '@/components/documents/schemas/documentSchema';

export async function fetchContactDocuments(contactId: string): Promise<Document[]> {
  if (!contactId) {
    console.error('No contact ID provided');
    return [];
  }
  
  try {
    // Fetch document records for this contact
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'CONTACT')
      .eq('entity_id', contactId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(`Error fetching contact documents: ${error.message}`);
    }
    
    // For each document, get a public URL
    const documentsWithUrls = await Promise.all(
      (data || []).map(async (document) => {
        try {
          const { data: urlData } = await supabase.storage
            .from('construction_documents')
            .getPublicUrl(document.storage_path);
            
          return {
            ...document,
            url: urlData.publicUrl,
            entity_type: document.entity_type as EntityType
          } as Document;
        } catch (err) {
          console.error(`Error getting URL for document ${document.document_id}:`, err);
          return {
            ...document,
            url: '',
            entity_type: document.entity_type as EntityType
          } as Document;
        }
      })
    );
    
    return documentsWithUrls;
  } catch (error: any) {
    console.error('Error in fetchContactDocuments:', error);
    toast({
      title: 'Error loading documents',
      description: error.message,
      variant: 'destructive'
    });
    return [];
  }
}
