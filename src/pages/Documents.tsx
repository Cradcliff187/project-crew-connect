// src/pages/Documents.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, Upload } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Document } from '@/components/documents/schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';
import EnhancedDocumentUploadDialog from '@/components/documents/EnhancedDocumentUploadDialog';
import DocumentCard from '@/components/workOrders/details/DocumentsList/DocumentCard';
import DocumentViewer from '@/components/workOrders/details/DocumentsList/DocumentViewer';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import DocumentVersionHistoryCard from '@/components/documents/DocumentVersionHistoryCard';
import DocumentRelationshipsView from '@/components/documents/DocumentRelationshipsView';
import { convertToWorkOrderDocument } from '@/components/documents/utils/documentTypeUtils';
import { WorkOrderDocument } from '@/components/workOrders/details/DocumentsList/types';

const DocumentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewDocument, setViewDocument] = useState<WorkOrderDocument | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: recentDocuments,
    isLoading,
    refetch: refreshRecentDocuments,
  } = useQuery({
    queryKey: ['recentDocuments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents_with_urls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching recent documents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load recent documents.',
          variant: 'destructive',
        });
        return [];
      }

      return data as Document[];
    },
  });

  const handleSearch = async () => {
    if (!searchTerm) return;

    navigate(`/documents?search=${searchTerm}`);
  };

  const handleDocumentUploadSuccess = (documentId?: string) => {
    refreshRecentDocuments();
    setIsUploadModalOpen(false);

    if (documentId) {
      // Navigate to the document detail view
      navigate(`/documents/${documentId}`);
    }
  };

  const handleViewDocument = (doc: Document) => {
    // Convert Document to WorkOrderDocument for viewer
    const workOrderDoc = convertToWorkOrderDocument(doc);
    setViewDocument(workOrderDoc);
  };

  const handleCloseViewer = () => {
    setViewDocument(null);
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>
                Here's a list of your most recently uploaded documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {isLoading ? (
                    <>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      ))}
                    </>
                  ) : recentDocuments && recentDocuments.length > 0 ? (
                    recentDocuments.map(doc => (
                      <DocumentCard
                        key={doc.document_id}
                        document={convertToWorkOrderDocument(doc)}
                        onViewDocument={() => handleViewDocument(doc)}
                      />
                    ))
                  ) : (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground">No documents found.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {viewDocument && viewDocument.document_id && (
          <div className="md:col-span-1 space-y-4">
            <DocumentVersionHistoryCard
              documentId={viewDocument.document_id}
              onVersionChange={document => {
                // Convert Document to WorkOrderDocument
                const workOrderDoc = convertToWorkOrderDocument(document);
                setViewDocument(workOrderDoc);
              }}
            />

            <DocumentRelationshipsView
              document={viewDocument}
              onViewDocument={doc => {
                setViewDocument(convertToWorkOrderDocument(doc));
              }}
              showManagementButton={false}
            />
          </div>
        )}
      </div>

      <EnhancedDocumentUploadDialog
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onSuccess={handleDocumentUploadSuccess}
        onCancel={() => setIsUploadModalOpen(false)}
        title="Upload New Document"
        description="Upload and categorize your document for easy access later"
        allowEntityTypeSelection={true}
      />

      {viewDocument && (
        <DocumentViewer
          document={viewDocument}
          open={!!viewDocument}
          onOpenChange={open => !open && handleCloseViewer()}
        />
      )}
    </div>
  );
};

export default DocumentsPage;
