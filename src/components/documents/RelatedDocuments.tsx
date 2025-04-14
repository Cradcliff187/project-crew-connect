import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from './schemas/documentSchema';
import { FileText, Loader2 } from 'lucide-react';

interface RelatedDocumentsProps {
  documentId: string;
  onDocumentSelect?: (document: Document) => void;
}

const RelatedDocuments: React.FC<RelatedDocumentsProps> = ({ documentId, onDocumentSelect }) => {
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRelatedDocuments = async () => {
      if (!documentId) return;

      setLoading(true);
      try {
        // Get the entity information for the current document
        const { data: currentDoc, error: currentDocError } = await supabase
          .from('documents')
          .select('entity_type, entity_id')
          .eq('document_id', documentId)
          .single();

        if (currentDocError || !currentDoc) {
          console.error('Error fetching document details:', currentDocError);
          return;
        }

        // If we have entity information, get other documents related to the same entity
        if (currentDoc.entity_type && currentDoc.entity_id) {
          const { data: relatedDocs, error: relatedDocsError } = await supabase
            .from('documents')
            .select('*')
            .eq('entity_type', currentDoc.entity_type)
            .eq('entity_id', currentDoc.entity_id)
            .neq('document_id', documentId) // Exclude the current document
            .order('created_at', { ascending: false })
            .limit(5);

          if (relatedDocsError) {
            console.error('Error fetching related documents:', relatedDocsError);
            return;
          }

          // For each document, get the public URL
          const docsWithUrls = await Promise.all(
            (relatedDocs || []).map(async doc => {
              const { data: urlData } = await supabase.storage
                .from('construction_documents')
                .getPublicUrl(doc.storage_path);

              return {
                ...doc,
                url: urlData.publicUrl,
              } as Document;
            })
          );

          setRelatedDocuments(docsWithUrls);
        }
      } catch (error) {
        console.error('Error in RelatedDocuments component:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedDocuments();
  }, [documentId]);

  if (loading) {
    return (
      <div className="py-2">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs text-muted-foreground">Loading related documents...</span>
        </div>
      </div>
    );
  }

  if (relatedDocuments.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <h3 className="text-sm font-medium mb-2">Related Documents</h3>
      <div className="space-y-1">
        {relatedDocuments.map(doc => (
          <div
            key={doc.document_id}
            onClick={() => onDocumentSelect && onDocumentSelect(doc)}
            className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <span className="text-xs truncate">{doc.file_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedDocuments;
