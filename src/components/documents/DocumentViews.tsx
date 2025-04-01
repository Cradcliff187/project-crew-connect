
import React, { useState } from 'react';
import { Document } from './schemas/documentSchema';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Eye, Filter, Plus, Trash2, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DocumentCard from './DocumentCard';
import { formatDate } from '@/lib/utils';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

interface DocumentViewsProps {
  documents: Document[];
  loading: boolean;
  activeFiltersCount: number;
  onView: (document: Document) => void;
  onDelete: (document: Document) => void;
  onBatchDelete?: (documentIds: string[]) => Promise<void>;
  onUploadClick: () => void;
}

export const DocumentViews = ({ 
  documents, 
  loading, 
  activeFiltersCount,
  onView, 
  onDelete,
  onBatchDelete,
  onUploadClick
}: DocumentViewsProps) => {
  // State for batch operations
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);
  
  // Toggle batch mode
  const toggleBatchMode = () => {
    setBatchMode(prev => !prev);
    if (batchMode) {
      // Clear selection when exiting batch mode
      setSelectedDocuments([]);
    }
  };
  
  // Handle document selection
  const handleToggleSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };
  
  // Select/deselect all documents
  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map(doc => doc.document_id));
    }
  };
  
  // Handle batch download
  const handleBatchDownload = () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to download",
        variant: "destructive",
      });
      return;
    }
    
    // Find and download the selected documents
    const docsToDownload = documents.filter(doc => 
      selectedDocuments.includes(doc.document_id) && doc.url
    );
    
    docsToDownload.forEach(doc => {
      if (doc.url) {
        window.open(doc.url, '_blank');
      }
    });
    
    toast({
      title: "Downloads initiated",
      description: `Started downloading ${docsToDownload.length} document(s)`,
    });
  };
  
  // Handle batch delete
  const handleBatchDelete = async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to delete",
        variant: "destructive",
      });
      return;
    }
    
    if (onBatchDelete) {
      try {
        setBatchDeleting(true);
        await onBatchDelete(selectedDocuments);
        // Clear selection after successful deletion
        setSelectedDocuments([]);
        toast({
          title: "Documents deleted",
          description: `Successfully deleted ${selectedDocuments.length} document(s)`,
        });
      } catch (error) {
        console.error("Error deleting documents:", error);
        toast({
          title: "Delete failed",
          description: "There was an error deleting the documents",
          variant: "destructive",
        });
      } finally {
        setBatchDeleting(false);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-sm border p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-[#0485ea]/10">
            <Filter className="h-10 w-10 text-[#0485ea]" />
          </div>
          <h3 className="text-lg font-semibold">No documents found</h3>
          <p className="text-muted-foreground max-w-md">
            {activeFiltersCount > 0 
              ? "Try adjusting your filters or uploading new documents." 
              : "Upload your first document to get started."}
          </p>
          <Button 
            className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={onUploadClick}
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>
    );
  }
  
  const getDocumentActions = (document: Document): ActionGroup[] => {
    return [
      {
        items: [
          {
            label: 'View',
            icon: <Eye className="w-4 h-4" />,
            onClick: () => onView(document)
          },
          {
            label: 'Download',
            icon: <Download className="w-4 h-4" />,
            onClick: () => {
              if (document.url) {
                window.open(document.url, '_blank');
              }
            }
          }
        ]
      },
      {
        items: [
          {
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => onDelete(document),
            className: 'text-destructive'
          }
        ]
      }
    ];
  };
  
  // Batch operations UI
  const renderBatchActions = () => {
    if (!batchMode) return null;
    
    return (
      <div className="flex flex-wrap items-center gap-2 p-2 mb-4 bg-gray-50 rounded-md border">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSelectAll}
        >
          {selectedDocuments.length === documents.length ? 'Deselect All' : 'Select All'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleBatchDownload}
          disabled={selectedDocuments.length === 0}
        >
          <Download className="h-4 w-4 mr-1" /> 
          Download ({selectedDocuments.length})
        </Button>
        
        {onBatchDelete && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBatchDelete}
            disabled={selectedDocuments.length === 0 || batchDeleting}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" /> 
            {batchDeleting ? 'Deleting...' : `Delete (${selectedDocuments.length})`}
          </Button>
        )}
        
        <div className="flex-1"></div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleBatchMode}
        >
          Exit Batch Mode
        </Button>
      </div>
    );
  };
  
  return (
    <>
      {/* Batch Mode Toggle */}
      <div className="flex justify-end mb-2">
        <Button 
          variant={batchMode ? "default" : "outline"} 
          size="sm"
          onClick={toggleBatchMode}
          className={batchMode ? "bg-[#0485ea] hover:bg-[#0375d1]" : ""}
        >
          <CheckSquare className="h-4 w-4 mr-1" />
          {batchMode ? 'Exit Batch Mode' : 'Batch Operations'}
        </Button>
      </div>

      {/* Batch Actions Bar */}
      {renderBatchActions()}
      
      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {documents.map((document) => (
          <div key={document.document_id} className="relative">
            {batchMode && (
              <div className="absolute top-3 left-3 z-10">
                <Checkbox
                  checked={selectedDocuments.includes(document.document_id)}
                  onCheckedChange={() => handleToggleSelection(document.document_id)}
                  className="bg-white border-gray-300"
                />
              </div>
            )}
            <DocumentCard
              document={document}
              onView={() => onView(document)}
              onDelete={!batchMode ? () => onDelete(document) : undefined}
              batchMode={batchMode}
              isSelected={selectedDocuments.includes(document.document_id)}
              onClick={batchMode ? () => handleToggleSelection(document.document_id) : undefined}
            />
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block relative overflow-x-auto shadow-md sm:rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {batchMode && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedDocuments.length === documents.length && documents.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>File Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow 
                key={document.document_id}
                className={selectedDocuments.includes(document.document_id) ? "bg-blue-50" : ""}
              >
                {batchMode && (
                  <TableCell className="w-10">
                    <Checkbox
                      checked={selectedDocuments.includes(document.document_id)}
                      onCheckedChange={() => handleToggleSelection(document.document_id)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{document.file_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {document.category || 'Other'}
                  </Badge>
                </TableCell>
                <TableCell>{document.entity_type.replace('_', ' ').toLowerCase()}</TableCell>
                <TableCell>{formatDate(document.created_at)}</TableCell>
                <TableCell className="text-right">
                  {batchMode ? (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onView(document)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  ) : (
                    <ActionMenu groups={getDocumentActions(document)} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default DocumentViews;
