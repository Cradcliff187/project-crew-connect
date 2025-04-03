
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';

export interface ContactDocument {
  id: string;
  contact_id: string;
  document_id: string;
  relationship_type: string;
  notes?: string;
  created_at: string;
  document?: Document;
}

// Fetch documents for a contact
export const fetchContactDocuments = async (contactId: string): Promise<Document[]> => {
  try {
    // First, get documents that are directly related to the contact
    const { data: directDocuments, error: directError } = await supabase
      .from('documents')
      .select('*')
      .eq('entity_type', 'CONTACT')
      .eq('entity_id', contactId);
      
    if (directError) throw directError;
    
    // Get documents where the contact is referenced
    const { data: referencedDocuments, error: refError } = await supabase
      .from('documents')
      .select('*')
      .eq('vendor_type', 'contact')
      .eq('vendor_id', contactId);
    
    if (refError) throw refError;
    
    // Combine all documents and remove duplicates
    const allDocuments = [...(directDocuments || []), ...(referencedDocuments || [])];
    
    // Generate signed URLs for each document
    const documentsWithUrls = await Promise.all(
      allDocuments.map(async (doc) => {
        let url = '';
        if (doc.storage_path) {
          const { data, error } = await supabase.storage
            .from('construction_documents')
            .createSignedUrl(doc.storage_path, 300, {
              download: false,
              transform: {
                width: 800,
                height: 800,
                quality: 80
              }
            });
            
          if (error) {
            console.error('Error generating signed URL:', error);
          } else {
            url = data.signedUrl;
          }
        }
        
        return {
          ...doc,
          url
        };
      })
    );
    
    return documentsWithUrls;
  } catch (error: any) {
    console.error("Error fetching contact documents:", error);
    toast({
      title: "Error",
      description: "Failed to load contact documents.",
      variant: "destructive"
    });
    return [];
  }
};

// Attach a document to a contact
export const attachDocumentToContact = async (
  contactId: string,
  documentId: string,
  notes?: string
): Promise<boolean> => {
  try {
    // Update the document with the contact as the entity
    const { error } = await supabase
      .from('documents')
      .update({
        entity_type: 'CONTACT',
        entity_id: contactId,
        notes: notes || null
      })
      .eq('document_id', documentId);
      
    if (error) throw error;
    
    toast({
      title: "Document Attached",
      description: "Document has been attached to the contact.",
      className: 'bg-[#0485ea]',
    });
    
    return true;
  } catch (error: any) {
    console.error("Error attaching document:", error);
    toast({
      title: "Error",
      description: "Failed to attach document to contact.",
      variant: "destructive"
    });
    return false;
  }
};

// Detach a document from a contact
export const detachDocumentFromContact = async (
  documentId: string
): Promise<boolean> => {
  try {
    // Update the document to remove the contact entity reference
    const { error } = await supabase
      .from('documents')
      .update({
        entity_type: 'DETACHED',
        entity_id: 'detached'
      })
      .eq('document_id', documentId);
      
    if (error) throw error;
    
    toast({
      title: "Document Detached",
      description: "Document has been detached from the contact.",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error detaching document:", error);
    toast({
      title: "Error",
      description: "Failed to detach document from contact.",
      variant: "destructive"
    });
    return false;
  }
};

// Get document type options
export const getDocumentRelationshipTypeOptions = () => [
  { value: 'INVOICE', label: 'Invoice' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'CERTIFICATION', label: 'Certification' },
  { value: 'RECEIPT', label: 'Receipt' },
  { value: 'OTHER', label: 'Other' }
];
