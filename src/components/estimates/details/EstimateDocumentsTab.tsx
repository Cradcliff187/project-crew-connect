
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileIcon, ExternalLink, PaperclipIcon, AlertTriangle, Mail } from "lucide-react";
import { useEstimateDocuments } from '@/components/documents/hooks/useEstimateDocuments';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import { Badge } from "@/components/ui/badge";
import { Document } from '@/components/documents/schemas/documentSchema';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DocumentShareDialog from '../detail/dialogs/DocumentShareDialog';

type EstimateDocumentsTabProps = {
  estimateId: string;
};

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({ estimateId }) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { documents, loading, error, refetchDocuments } = useEstimateDocuments(estimateId);
  const { viewDocument, isViewerOpen, currentDocument, closeViewer } = useDocumentViewer();
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };
  
  const handleDocumentUploadSuccess = () => {
    setIsUploadOpen(false);
    refetchDocuments();
  };

  const handleShareDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsShareOpen(true);
  };
  
  const getDocumentTypeColor = (doc: Document) => {
    if (doc.is_vendor_doc) return "bg-amber-100 text-amber-800 border-amber-200";
    if (doc.is_subcontractor_doc) return "bg-purple-100 text-purple-800 border-purple-200";
    if (doc.item_reference && doc.item_reference.startsWith("Item:")) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };
  
  const getDocumentTypeLabel = (doc: Document) => {
    if (doc.is_vendor_doc) return "Vendor Document";
    if (doc.is_subcontractor_doc) return "Subcontractor Document";
    if (doc.item_reference && doc.item_reference.startsWith("Item:")) return "Line Item Document";
    return "Estimate Document";
  };

  // Check if we have any documents from any source
  const hasDocuments = documents && documents.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Estimate Documents</CardTitle>
              <CardDescription>Documents associated with this estimate</CardDescription>
            </div>
            <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="bg-[#0485ea] hover:bg-[#0373ce]">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[90vw] sm:max-w-[600px] p-0">
                <SheetHeader className="p-6 pb-2">
                  <SheetTitle>Upload Document</SheetTitle>
                </SheetHeader>
                <EnhancedDocumentUpload 
                  entityType="ESTIMATE"
                  entityId={estimateId}
                  onSuccess={handleDocumentUploadSuccess}
                  onCancel={() => setIsUploadOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading documents...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Error loading documents:</p>
              <p className="font-mono text-sm">{error}</p>
            </div>
          ) : !hasDocuments ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg p-6 bg-gray-50">
              <FileIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="mb-2">No documents found for this estimate.</p>
              <p className="text-sm mb-4">Upload a document to attach it to this estimate.</p>
              <Button 
                onClick={() => setIsUploadOpen(true)}
                className="bg-[#0485ea] hover:bg-[#0373ce]"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <TooltipProvider key={doc.document_id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <FileIcon className="h-8 w-8 text-[#0485ea]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm mb-1 truncate" title={doc.file_name}>
                              {doc.file_name}
                            </h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className={getDocumentTypeColor(doc)}>
                                {getDocumentTypeLabel(doc)}
                              </Badge>
                              {doc.is_expense && (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  Expense
                                </Badge>
                              )}
                            </div>
                            {doc.item_reference && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2" title={doc.item_reference}>
                                {doc.item_reference}
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                              <PaperclipIcon className="h-3 w-3" />
                              <span>{doc.file_type}</span>
                              {doc.file_size && (
                                <span className="ml-2">
                                  {(doc.file_size / 1024).toFixed(0)} KB
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewDocument(doc.document_id);
                                }}
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">View</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareDocument(doc);
                                }}
                              >
                                <Mail className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">Share</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Document options</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {isViewerOpen && currentDocument && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-medium">{currentDocument.file_name}</h3>
              <div className="flex gap-2">
                {currentDocument.url && (
                  <a 
                    href={currentDocument.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                  </a>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareDocument(currentDocument);
                  }}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button size="sm" variant="ghost" onClick={closeViewer}>
                  Close
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {currentDocument.file_type?.includes('image') ? (
                <img 
                  src={currentDocument.url} 
                  alt={currentDocument.file_name}
                  className="max-w-full h-auto mx-auto" 
                />
              ) : currentDocument.file_type?.includes('pdf') ? (
                <iframe 
                  src={`${currentDocument.url}#toolbar=0`} 
                  className="w-full h-full min-h-[500px]"
                  title={currentDocument.file_name}
                />
              ) : (
                <div className="text-center py-8">
                  <p>Preview not available for this file type.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please use the Open button to view this document.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <DocumentShareDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        document={selectedDocument}
        estimateId={estimateId}
      />
    </>
  );
};

export default EstimateDocumentsTab;
