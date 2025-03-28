
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { PaperclipIcon, XIcon, FileIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

const EstimateDocumentUpload: React.FC = () => {
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [attachedDocuments, setAttachedDocuments] = useState<Document[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  const form = useFormContext<EstimateFormValues>();
  const documentIds = form.watch('estimate_documents') || [];

  // Fetch attached documents whenever documentIds changes
  React.useEffect(() => {
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

  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Estimate Documents</h3>
        <Sheet open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
          <SheetTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="bg-[#0485ea] text-white hover:bg-[#0375d1]"
            >
              <PaperclipIcon className="h-4 w-4 mr-1" />
              Attach Document
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[90vw] sm:max-w-[600px] p-0">
            <SheetHeader className="p-6 pb-2">
              <SheetTitle>Attach Document to Estimate</SheetTitle>
            </SheetHeader>
            
            <EnhancedDocumentUpload 
              entityType="ESTIMATE"
              entityId="pending" // We'll update this when the estimate is created
              onSuccess={handleDocumentUploadSuccess}
              onCancel={() => setIsDocumentUploadOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Display attached documents */}
      {attachedDocuments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {attachedDocuments.map(document => (
            <Card key={document.document_id} className="flex items-center p-2">
              <CardContent className="p-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileIcon className="h-5 w-5 text-[#0485ea]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{document.file_name}</p>
                    <p className="text-xs text-muted-foreground">{document.category || 'Document'}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreviewDocument(document)}
                    className="text-[#0485ea] h-8 w-8 p-0"
                  >
                    <span className="sr-only">Preview</span>
                    View
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDocument(document.document_id)}
                    className="text-red-500 h-8 w-8 p-0"
                  >
                    <XIcon className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No documents attached yet.</p>
        </div>
      )}
      
      {/* Document Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.file_name}</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="flex justify-center overflow-hidden">
              <iframe
                src={`${selectedDocument.url}#toolbar=1`}
                className="w-full h-[70vh] border rounded"
                title={selectedDocument.file_name}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstimateDocumentUpload;
