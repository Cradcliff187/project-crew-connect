
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from './schemas/documentSchema';
import { Loader2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface RelatedDocumentsProps {
  documentId: string;
  onDocumentSelect?: (document: Document) => void;
}

const RelatedDocuments: React.FC<RelatedDocumentsProps> = ({ documentId, onDocumentSelect }) => {
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedDocuments = async () => {
      if (!documentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch documents related to the same entity
        const { data: documentData, error: docError } = await supabase
          .from('documents')
          .select('*')
          .eq('document_id', documentId)
          .single();
        
        if (docError) throw docError;
        
        if (documentData && documentData.entity_id && documentData.entity_type) {
          // Fetch all documents for the same entity, excluding the current one
          const { data: relatedDocs, error: relatedError } = await supabase
            .from('documents')
            .select('*')
            .eq('entity_id', documentData.entity_id)
            .eq('entity_type', documentData.entity_type)
            .neq('document_id', documentId)
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (relatedError) throw relatedError;
          
          // Get signed URLs for each document
          const docsWithUrls = await Promise.all(
            (relatedDocs || []).map(async (doc) => {
              const { data } = await supabase.storage
                .from('construction_documents')
                .getPublicUrl(doc.storage_path);
              
              return {
                ...doc,
                url: data.publicUrl
              } as Document;
            })
          );
          
          setRelatedDocuments(docsWithUrls);
        }
      } catch (err) {
        console.error('Error fetching related documents:', err);
        setError('Failed to load related documents');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelatedDocuments();
  }, [documentId]);
  
  if (loading) {
    return (
      <div>
        <h3 className="text-sm font-medium mb-2">Related Documents</h3>
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return null; // Don't show anything if there's an error
  }
  
  if (relatedDocuments.length === 0) {
    return null; // Don't show the section if no related documents
  }
  
  return (
    <div>
      <Separator className="my-4" />
      <h3 className="text-sm font-medium mb-2">Related Documents</h3>
      <div className="space-y-2">
        {relatedDocuments.map((doc) => (
          <Button
            key={doc.document_id}
            variant="ghost"
            className="w-full justify-start text-left p-2 h-auto"
            onClick={() => onDocumentSelect && onDocumentSelect(doc)}
          >
            <Link2 className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{doc.file_name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RelatedDocuments;
