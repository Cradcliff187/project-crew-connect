
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { PaperclipIcon, XIcon, FileIcon, FileTextIcon, FileImageIcon, UploadIcon, EyeIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import DocumentPreviewCard from '@/components/documents/DocumentPreviewCard';
import { Badge } from '@/components/ui/badge';

// Helper function to get icon based on file type
const getDocumentIcon = (fileType?: string) => {
  if (!fileType) return <FileIcon className="h-4 w-4" />;
  
  if (fileType?.includes('image')) {
    return <FileImageIcon className="h-4 w-4" />;
  } else if (fileType?.includes('pdf')) {
    return <FileTextIcon className="h-4 w-4" />;
  }
  
  return <FileIcon className="h-4 w-4" />;
};

const EstimateDocumentUpload: React.FC = () => {
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [attachedDocuments, setAttachedDocuments] = useState<Document[]>([]);
  
  const form = useFormContext<EstimateFormValues>();
  const documentIds = form.watch('estimate_documents') || [];
  const tempId = form.watch('temp_id');
  
  // Use the document viewer hook
  const { 
    viewDocument, 
    closeViewer, 
    isViewerOpen, 
    currentDocument 
  } = useDocumentViewer();

  // Fetch attached documents whenever documentIds changes
  useEffect(() => {
    const fetchDocuments = async () => {
      if (documentIds.length === 0) {
        setAttachedDocuments([]);
        return;
      }

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
        return;
      }

      setAttachedDocuments(data || []);
    };

    fetchDocuments();
  }, [documentIds]);

  const handleDocumentUploadSuccess = (documentId?: string) => {
    setIsDocumentUploadOpen(false);
    if (documentId) {
      // Add document ID to the form
      const updatedDocumentIds = [...documentIds, documentId];
      form.setValue('estimate_documents', updatedDocumentIds);
      
      toast({
        title: 'Document attached',
        description: 'Document has been attached to the estimate',
      });
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    // Filter out the removed document ID
    const updatedDocumentIds = documentIds.filter(id => id !== documentId);
    form.setValue('estimate_documents', updatedDocumentIds);
    
    toast({
      title: 'Document removed',
      description: 'Document has been removed from the estimate',
    });
  };

  const handlePreviewDocument = (documentId: string) => {
    viewDocument(documentId);
  };

  // Prevent form submission when opening document upload
  const handleOpenDocumentUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDocumentUploadOpen(true);
  };

  // Categorize documents by type
  const documentsByCategory: Record<string, Document[]> = {};
  attachedDocuments.forEach(doc => {
    const category = doc.category || 'Other';
    if (!documentsByCategory[category]) {
      documentsByCategory[category] = [];
    }
    documentsByCategory[category].push(doc);
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <PaperclipIcon className="h-4 w-4 text-[#0485ea]" />
          Estimate Documents
          {attachedDocuments.length > 0 && (
            <Badge variant="outline" className="ml-1 text-xs bg-blue-50">
              {attachedDocuments.length}
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
              <SheetTitle>Attach Document to Estimate</SheetTitle>
            </SheetHeader>
            
            {tempId && (
              <EnhancedDocumentUpload 
                entityType="ESTIMATE"
                entityId={tempId}
                onSuccess={handleDocumentUploadSuccess}
                onCancel={() => setIsDocumentUploadOpen(false)}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Display attached documents */}
      {attachedDocuments.length > 0 ? (
        <div className="space-y-4">
          {Object.keys(documentsByCategory).length > 0 ? (
            Object.entries(documentsByCategory).map(([category, docs]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600 capitalize">{category}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {docs.map(document => (
                    <DocumentPreviewCard
                      key={document.document_id}
                      document={document}
                      onView={() => handlePreviewDocument(document.document_id)}
                      onDelete={() => handleRemoveDocument(document.document_id)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {attachedDocuments.map(document => (
                <DocumentPreviewCard
                  key={document.document_id}
                  document={document}
                  onView={() => handlePreviewDocument(document.document_id)}
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
      
      {/* Document Preview Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={closeViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh]" aria-describedby="document-preview">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentDocument?.file_type && getDocumentIcon(currentDocument.file_type)}
              <span>{currentDocument?.file_name}</span>
            </DialogTitle>
          </DialogHeader>
          {currentDocument && (
            <div className="flex justify-center overflow-hidden">
              <iframe
                id="document-preview"
                src={`${currentDocument.url}#toolbar=1`}
                className="w-full h-[70vh] border rounded"
                title={currentDocument.file_name}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstimateDocumentUpload;
