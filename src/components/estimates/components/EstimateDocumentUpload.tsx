import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { 
  PaperclipIcon, 
  XIcon, 
  FileIcon, 
  FileTextIcon, 
  FileImageIcon, 
  UploadIcon, 
  EyeIcon, 
  FolderIcon, 
  InfoIcon 
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import DocumentViewer from '@/components/documents/DocumentViewer';
import DocumentPreviewCard from '@/components/documents/DocumentPreviewCard';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const isLineItemDocument = (document: Document) => {
  return !!(document.item_id || document.item_reference);
};

const categorizeDocuments = (documents: Document[]) => {
  const documentsByCategory: Record<string, Document[]> = {};
  documents.forEach(doc => {
    const category = doc.category || 'Other';
    if (!documentsByCategory[category]) {
      documentsByCategory[category] = [];
    }
    documentsByCategory[category].push(doc);
  });
  return documentsByCategory;
};

interface EstimateDocumentUploadProps {
  estimateItemId?: string;
  showLineItemDocuments?: boolean;
}

const EstimateDocumentUpload: React.FC<EstimateDocumentUploadProps> = ({
  estimateItemId,
  showLineItemDocuments = false
}) => {
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [attachedDocuments, setAttachedDocuments] = useState<Document[]>([]);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  
  const form = useFormContext<EstimateFormValues>();
  const documentIds = form.watch('estimate_documents') || [];
  const tempId = form.watch('temp_id');

  useEffect(() => {
    const fetchDocuments = async () => {
      if (documentIds.length === 0) {
        setAttachedDocuments([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .in('document_id', documentIds);

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load attached documents',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setAttachedDocuments(data || []);
      setLoading(false);
    };

    fetchDocuments();
  }, [documentIds]);

  const handleDocumentUploadSuccess = (documentId?: string) => {
    setIsDocumentUploadOpen(false);
    if (documentId) {
      const updatedDocumentIds = [...documentIds, documentId];
      form.setValue('estimate_documents', updatedDocumentIds);
      
      toast({
        title: 'Document attached',
        description: 'Document has been attached to the estimate',
      });
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    const updatedDocumentIds = documentIds.filter(id => id !== documentId);
    form.setValue('estimate_documents', updatedDocumentIds);
    
    toast({
      title: 'Document removed',
      description: 'Document has been removed from the estimate',
    });
  };

  const handleViewDocument = (document: Document) => {
    setViewDocument(document);
  };

  const closeViewer = () => {
    setViewDocument(null);
  };

  const handleOpenDocumentUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDocumentUploadOpen(true);
  };

  const documentsByCategory = categorizeDocuments(attachedDocuments);
  
  const filteredDocuments = showLineItemDocuments 
    ? attachedDocuments.filter(isLineItemDocument)
    : attachedDocuments.filter(doc => !isLineItemDocument(doc));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <PaperclipIcon className="h-4 w-4 text-[#0485ea]" />
          {showLineItemDocuments ? "Line Item Documents" : "Estimate Documents"}
          {filteredDocuments.length > 0 && (
            <Badge variant="outline" className="ml-1 text-xs bg-blue-50">
              {filteredDocuments.length}
            </Badge>
          )}
        </h3>
        <Sheet open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="bg-[#0485ea] text-white hover:bg-[#0375d1]"
            onClick={handleOpenDocumentUpload}
          >
            <UploadIcon className="h-4 w-4 mr-1" />
            Add Document
          </Button>
          <SheetContent className="w-[90vw] sm:max-w-[600px] p-0">
            <SheetHeader className="p-6 pb-2">
              <SheetTitle>
                {showLineItemDocuments 
                  ? "Attach Document to Line Item" 
                  : "Attach Document to Estimate"}
              </SheetTitle>
            </SheetHeader>
            
            {tempId && (
              <EnhancedDocumentUpload 
                entityType={showLineItemDocuments ? "ESTIMATE_ITEM" : "ESTIMATE"}
                entityId={showLineItemDocuments ? estimateItemId || tempId : tempId}
                onSuccess={handleDocumentUploadSuccess}
                onCancel={() => setIsDocumentUploadOpen(false)}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
      
      {filteredDocuments.length > 0 ? (
        <div className="space-y-4">
          {Object.keys(documentsByCategory).length > 0 ? (
            Object.entries(documentsByCategory).map(([category, docs]) => {
              const filteredCategoryDocs = showLineItemDocuments 
                ? docs.filter(isLineItemDocument)
                : docs.filter(doc => !isLineItemDocument(doc));
              
              if (filteredCategoryDocs.length === 0) return null;
              
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600 capitalize flex items-center">
                    <FolderIcon className="h-4 w-4 mr-1 text-[#0485ea]" />
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredCategoryDocs.map(document => (
                      <DocumentPreviewCard
                        key={document.document_id}
                        document={document}
                        onView={() => handleViewDocument(document)}
                        onDelete={() => handleRemoveDocument(document.document_id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredDocuments.map(document => (
                <DocumentPreviewCard
                  key={document.document_id}
                  document={document}
                  onView={() => handleViewDocument(document)}
                  onDelete={() => handleRemoveDocument(document.document_id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <div className="flex flex-col items-center gap-2">
            <PaperclipIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No documents attached yet.</p>
            <p className="text-xs text-muted-foreground">
              Click "Add Document" to attach receipts, contracts, or other relevant files.
            </p>
          </div>
        </div>
      )}
      
      <DocumentViewer
        document={viewDocument}
        open={!!viewDocument}
        onOpenChange={(open) => !open && closeViewer()}
      />
    </div>
  );
};

export default EstimateDocumentUpload;
