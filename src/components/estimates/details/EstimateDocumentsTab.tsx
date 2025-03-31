
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaperclipIcon, UploadIcon, FileTextIcon, FileIcon, FileImageIcon, EyeIcon, FolderIcon } from "lucide-react";
import { useEstimateDocuments } from "@/components/documents/hooks/useEstimateDocuments";
import { Document } from "@/components/documents/schemas/documentSchema";
import DocumentPreviewCard from "@/components/documents/DocumentPreviewCard";
import DocumentViewer from "@/components/documents/DocumentViewer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDocumentCount } from "@/hooks/useDocumentCount";
import { Skeleton } from "@/components/ui/skeleton";

interface EstimateDocumentsTabProps {
  estimateId: string;
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({ estimateId }) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const { count } = useDocumentCount("ESTIMATE", estimateId);
  
  const { 
    documents, 
    loading, 
    error,
    refetchDocuments
  } = useEstimateDocuments(estimateId);

  useEffect(() => {
    console.log(`EstimateDocumentsTab: Mounted with estimateId=${estimateId}, found ${documents.length} documents`);
    return () => {
      console.log(`EstimateDocumentsTab: Unmounting with estimateId=${estimateId}`);
    };
  }, [estimateId, documents.length]);

  // Get unique categories
  const categories = Array.from(
    new Set(documents.map(doc => doc.category || 'Uncategorized'))
  ).filter(Boolean);

  // Group documents by category for display
  const documentsByCategory: Record<string, Document[]> = {};
  documents.forEach(doc => {
    const category = doc.category || 'Uncategorized';
    if (!documentsByCategory[category]) {
      documentsByCategory[category] = [];
    }
    documentsByCategory[category].push(doc);
  });

  // Filter documents based on tab
  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'all') return true;
    if (activeTab === 'line-items') return !!doc.item_id;
    return doc.category === activeTab;
  });

  const handleViewDocument = (doc: Document) => {
    console.log('Viewing document:', doc.document_id, doc.file_name);
    setViewDocument(doc);
  };

  const closeViewer = () => {
    setViewDocument(null);
  };

  return (
    <Card className="border border-[#0485ea]/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Estimate Documents</CardTitle>
          {count > 0 && (
            <Badge variant="outline" className="bg-blue-50">
              {count}
            </Badge>
          )}
        </div>
        
        <Button 
          variant="outline" 
          className="text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50"
          disabled
        >
          <UploadIcon className="h-4 w-4 mr-1" />
          Add Document
        </Button>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">
            <p>Error loading documents: {error}</p>
          </div>
        ) : documents.length > 0 ? (
          <div className="space-y-6">
            {(categories.length > 1 || documents.some(d => !!d.item_id)) && (
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="all">All Documents</TabsTrigger>
                  {documents.some(d => !!d.item_id) && (
                    <TabsTrigger value="line-items">Line Item Documents</TabsTrigger>
                  )}
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
            
            {activeTab === 'all' ? (
              <div className="space-y-6">
                {Object.entries(documentsByCategory).map(([category, docs]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-600 capitalize flex items-center">
                      <FolderIcon className="h-4 w-4 mr-1 text-[#0485ea]" />
                      {category}
                      <Badge variant="outline" className="ml-2 bg-blue-50">
                        {docs.length}
                      </Badge>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {docs.map(doc => (
                        <DocumentPreviewCard
                          key={doc.document_id}
                          document={doc}
                          onView={() => handleViewDocument(doc)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredDocuments.map(doc => (
                  <DocumentPreviewCard
                    key={doc.document_id}
                    document={doc}
                    onView={() => handleViewDocument(doc)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="flex flex-col items-center gap-2">
              <PaperclipIcon className="h-10 w-10 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No documents attached to this estimate.</p>
              <p className="text-xs text-muted-foreground">
                Add documents to keep track of receipts, quotes, and other important files.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Document Viewer */}
      <DocumentViewer 
        document={viewDocument}
        open={!!viewDocument}
        onOpenChange={(open) => !open && closeViewer()}
      />
    </Card>
  );
};

export default EstimateDocumentsTab;
