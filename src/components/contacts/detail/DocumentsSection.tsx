import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, X, Loader2, FileText } from 'lucide-react';
import { Contact } from '@/pages/Contacts';
import { fetchContactDocuments } from './util/contactDocuments';
import { Document } from '@/components/documents/schemas/documentSchema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import DocumentList from '@/components/documents/DocumentList';
import { useQueryClient } from '@tanstack/react-query';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import DocumentViewer from '@/components/documents/DocumentViewer';
import DocumentMetricsCard from './DocumentMetricsCard';

interface DocumentsSectionProps {
  contact: Contact;
  onDocumentAdded?: () => void;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ contact, onDocumentAdded }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const queryClient = useQueryClient();

  // Load documents on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      if (!contact?.id) return;

      setLoading(true);
      try {
        const docs = await fetchContactDocuments(contact.id);
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [contact?.id]);

  // Handle document upload
  const handleUploadSuccess = () => {
    setUploadOpen(false);

    // Refresh documents
    fetchContactDocuments(contact.id).then(docs => {
      setDocuments(docs);
    });

    // Notify parent component
    if (onDocumentAdded) {
      onDocumentAdded();
    }

    // Refresh contacts data
    queryClient.invalidateQueries({ queryKey: ['contacts'] });
  };

  // Handle viewing a document
  const handleViewDocument = (doc: Document) => {
    setViewDocument(doc);
    setIsViewerOpen(true);
  };

  // Render loading state
  if (loading && documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Documents</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-[#0485ea] animate-spin mb-4" />
          <p className="text-muted-foreground">Loading documents...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics card at the top */}
      <DocumentMetricsCard documents={documents} loading={loading} />

      {/* Main documents card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Contact Documents</CardTitle>
            <Button onClick={() => setUploadOpen(true)} className="bg-[#0485ea] hover:bg-[#0375d1]">
              <Upload className="h-4 w-4 mr-1" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                Upload documents related to this contact to keep track of contracts, certifications,
                and more.
              </p>
              <Button
                onClick={() => setUploadOpen(true)}
                className="mt-2 bg-[#0485ea] hover:bg-[#0375d1]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Document
              </Button>
            </div>
          ) : (
            <DocumentList
              documents={documents}
              loading={loading}
              onView={handleViewDocument}
              showEntityInfo={false}
              showNavigationButtons
            />
          )}
        </CardContent>
      </Card>

      {/* Document Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Document for {contact.name}</DialogTitle>
            <DialogDescription>
              Upload documents related to this contact such as contracts, certifications, or
              correspondence.
            </DialogDescription>
          </DialogHeader>
          <EnhancedDocumentUpload
            entityType={'CONTACT' as EntityType}
            entityId={contact.id}
            onSuccess={handleUploadSuccess}
            onCancel={() => setUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      {viewDocument && (
        <DocumentViewer
          document={viewDocument}
          open={isViewerOpen}
          onOpenChange={open => {
            setIsViewerOpen(open);
            if (!open) setViewDocument(null);
          }}
        />
      )}
    </div>
  );
};

export default DocumentsSection;
