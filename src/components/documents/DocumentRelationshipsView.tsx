
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Link as LinkIcon, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { WorkOrderDocument } from '../workOrders/details/DocumentsList/types';
import { convertToDocument, convertToWorkOrderDocument } from './utils/documentTypeUtils';

interface DocumentRelationshipsViewProps {
  document: Document | WorkOrderDocument;
  onViewDocument: (document: Document | WorkOrderDocument) => void;
  showManagementButton?: boolean;
}

const DocumentRelationshipsView: React.FC<DocumentRelationshipsViewProps> = ({
  document,
  onViewDocument,
  showManagementButton = true
}) => {
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Normalize document to Document type
  const normalizedDocument = 'document_id' in document ? 
    document as Document : 
    convertToDocument(document as WorkOrderDocument);
  
  // Load related documents
  useEffect(() => {
    const fetchRelatedDocuments = async () => {
      if (!normalizedDocument.document_id) return;
      
      setLoading(true);
      
      try {
        // Fetch source relationships
        const { data: sourceData, error: sourceError } = await supabase
          .from('document_relationships')
          .select('target_document_id')
          .eq('source_document_id', normalizedDocument.document_id);
        
        if (sourceError) throw sourceError;
        
        // Fetch target relationships
        const { data: targetData, error: targetError } = await supabase
          .from('document_relationships')
          .select('source_document_id')
          .eq('target_document_id', normalizedDocument.document_id);
        
        if (targetError) throw targetError;
        
        // Combine unique document IDs
        const relatedDocIds = [
          ...sourceData.map(item => item.target_document_id),
          ...targetData.map(item => item.source_document_id)
        ];
        
        // Filter out duplicates
        const uniqueDocIds = [...new Set(relatedDocIds)];
        
        if (uniqueDocIds.length === 0) {
          setRelatedDocuments([]);
          setLoading(false);
          return;
        }
        
        // Fetch document details
        const { data: docsData, error: docsError } = await supabase
          .from('documents_with_urls')
          .select('*')
          .in('document_id', uniqueDocIds);
        
        if (docsError) throw docsError;
        
        setRelatedDocuments(docsData as Document[]);
      } catch (error) {
        console.error('Error fetching related documents:', error);
        setRelatedDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelatedDocuments();
  }, [normalizedDocument.document_id]);
  
  const handleViewRelatedDocument = (doc: Document) => {
    if (onViewDocument) {
      // Convert to appropriate type based on what the parent expects
      if ('is_receipt' in document) {
        // Parent expects WorkOrderDocument
        onViewDocument(convertToWorkOrderDocument(doc));
      } else {
        // Parent expects Document
        onViewDocument(doc);
      }
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Document Relationships</CardTitle>
          {showManagementButton && (
            <Button 
              variant="outline"
              size="sm"
              className="text-xs h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Relationship
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : relatedDocuments.length > 0 ? (
          <div className="space-y-2 mt-2">
            {relatedDocuments.map(doc => (
              <div 
                key={doc.document_id} 
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                onClick={() => handleViewRelatedDocument(doc)}
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {doc.entity_type.toLowerCase()} • {doc.category || 'document'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <LinkIcon className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mt-2">No related documents found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentRelationshipsView;
