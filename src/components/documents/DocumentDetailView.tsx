
import React, { useState } from 'react';
import { Document } from './schemas/documentSchema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText, Pencil, Trash2, Info, LinkIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getCategoryConfig } from './utils/categoryIcons';
import DocumentViewer from './DocumentViewer';
import DocumentRelationshipsTab from './DocumentRelationshipsTab';
import NavigateToEntityButton from './NavigateToEntityButton';

interface DocumentDetailViewProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onEditMetadata?: () => void;
  onViewRelatedDocument?: (document: Document) => void;
}

const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  document,
  open,
  onClose,
  onDelete,
  onEditMetadata,
  onViewRelatedDocument
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  
  if (!document) return null;
  
  const handleDownload = () => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };
  
  // Get category configuration for styling
  const categoryConfig = document.category 
    ? getCategoryConfig(document.category) 
    : { color: '#6b7280', label: 'Document', icon: FileText };
    
  const CategoryIcon = categoryConfig.icon;
  
  // Get entity type display name
  const getEntityTypeDisplay = (entityType: string) => {
    switch (entityType.toUpperCase()) {
      case 'PROJECT':
        return 'Project';
      case 'WORK_ORDER':
        return 'Work Order';
      case 'CONTACT':
        return 'Contact';
      case 'VENDOR':
        return 'Vendor';
      case 'SUBCONTRACTOR':
        return 'Subcontractor';
      case 'ESTIMATE':
        return 'Estimate';
      default:
        return entityType;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="truncate pr-8">{document.file_name}</DialogTitle>
            <div className="flex gap-1">
              {/* Navigate to entity button */}
              {document.entity_type && document.entity_id && (
                <NavigateToEntityButton document={document} variant="outline" size="sm" />
              )}
              
              {/* Download button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
                disabled={!document.url}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              
              {/* Edit metadata button (if provided) */}
              {onEditMetadata && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onEditMetadata}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              
              {/* Delete button (if provided) */}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onDelete}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList>
            <TabsTrigger value="preview" className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center">
              <Info className="h-4 w-4 mr-1" />
              Details
            </TabsTrigger>
            <TabsTrigger value="relationships" className="flex items-center">
              <LinkIcon className="h-4 w-4 mr-1" />
              Relationships
            </TabsTrigger>
          </TabsList>
          
          <TabsContent 
            value="preview" 
            className="flex-1 overflow-auto border rounded-md mt-4 bg-muted/20"
          >
            <DocumentViewer 
              document={document} 
              embedded={true}
            />
          </TabsContent>
          
          <TabsContent 
            value="details" 
            className="flex-1 overflow-auto p-4 border rounded-md mt-4"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Document Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">File Name</span>
                    <span className="font-medium truncate">{document.file_name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">File Type</span>
                    <span className="font-medium">{document.file_type || 'Unknown'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{formatDate(document.created_at)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{formatDate(document.updated_at)}</span>
                  </div>
                  {document.file_size && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="font-medium">
                        {(document.file_size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                  {document.version && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-medium">v{document.version}</span>
                    </div>
                  )}
                  {document.category && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium flex items-center">
                        <CategoryIcon className="h-4 w-4 mr-1" style={{ color: categoryConfig.color }} />
                        {categoryConfig.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {document.entity_type && document.entity_id && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Associated Entity</h3>
                  <div className="border rounded-md p-3 bg-muted/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">
                          {getEntityTypeDisplay(document.entity_type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {document.entity_id}
                        </p>
                      </div>
                      <NavigateToEntityButton document={document} variant="outline" size="sm" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Document notes */}
              {document.notes && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Notes</h3>
                  <div className="border rounded-md p-3 bg-muted/20">
                    <p className="text-sm whitespace-pre-line">{document.notes}</p>
                  </div>
                </div>
              )}
              
              {/* Document tags */}
              {document.tags && document.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-1 bg-muted text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent 
            value="relationships" 
            className="flex-1 overflow-auto p-4 border rounded-md mt-4"
          >
            <DocumentRelationshipsTab 
              document={document}
              onViewDocument={onViewRelatedDocument || (() => {})}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailView;
