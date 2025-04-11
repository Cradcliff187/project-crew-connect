
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Grid2X2, List } from 'lucide-react';
import DocumentsTable from './DocumentsTable';
import DocumentGrid from './DocumentGrid';
import { Document, EntityType } from './schemas/documentSchema';
import { categorizeDocuments } from './utils/documentUtils';
import useDocumentManager from './hooks/useDocumentManager';
import DocumentUploadDialog from './DocumentUploadDialog';
import DocumentDetailView from './DocumentDetailView';
import DocumentsFilter from './filters/DocumentsFilter';
import { DocumentFilterState } from './hooks/useDocumentFilters';
import DocumentMetrics from './DocumentMetrics';
import DocumentUploadButton from './DocumentUploadButton';

interface DocumentsSectionProps {
  entityType: EntityType;
  entityId: string;
  title: string;
  description?: string;
  showMetrics?: boolean;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  entityType,
  entityId,
  title,
  description,
  showMetrics = false,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [filters, setFilters] = useState<DocumentFilterState>({
    search: '',
    startDate: null,
    endDate: null,
    categories: [],
    tags: []
  });
  
  const { 
    documents, 
    loading, 
    currentDocument,
    isDetailViewOpen,
    handleViewDocument,
    handleCloseDetailView,
    handleDeleteDocument,
    handleDocumentUploaded,
    selectRelatedDocument,
    fetchDocuments
  } = useDocumentManager(entityType, entityId);

  // Filter documents based on current filters
  const filteredDocuments = React.useMemo(() => {
    return documents.filter(doc => {
      // Search filter
      if (filters.search && !matchesSearch(doc, filters.search.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filters.categories.length > 0 && doc.category && !filters.categories.includes(doc.category)) {
        return false;
      }
      
      // Tags filter
      if (filters.tags.length > 0 && doc.tags) {
        const docTags = doc.tags || [];
        if (!filters.tags.some(tag => docTags.includes(tag))) {
          return false;
        }
      }
      
      // Date range filter
      const docDate = new Date(doc.created_at);
      if (filters.startDate && docDate < filters.startDate) {
        return false;
      }
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (docDate > endOfDay) {
          return false;
        }
      }
      
      return true;
    });
  }, [documents, filters]);
  
  // Update filters
  const updateFilters = (newFilters: Partial<DocumentFilterState>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      startDate: null,
      endDate: null,
      categories: [],
      tags: []
    });
  };
  
  // Reset filters when entity changes
  useEffect(() => {
    resetFilters();
  }, [entityType, entityId]);

  // Helper function to check if a document matches the search query
  const matchesSearch = (document: Document, searchQuery: string): boolean => {
    // Match file name
    if (document.file_name.toLowerCase().includes(searchQuery)) {
      return true;
    }
    
    // Match category
    if (document.category && document.category.toLowerCase().includes(searchQuery)) {
      return true;
    }
    
    // Match tags
    if (document.tags && document.tags.some(tag => tag.toLowerCase().includes(searchQuery))) {
      return true;
    }
    
    // Match notes
    if (document.notes && document.notes.toLowerCase().includes(searchQuery)) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-[#0485ea]" />
                    {title}
                  </CardTitle>
                  {description && (
                    <CardDescription className="mt-1">{description}</CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <DocumentUploadButton 
                    onUploadClick={() => setUploadDialogOpen(true)} 
                  />
                </div>
              </div>
            </CardHeader>
            
            {showMetrics && documents.length > 0 && (
              <CardContent className="pt-0 pb-2">
                <DocumentMetrics documents={documents} />
              </CardContent>
            )}
            
            <CardHeader className="py-2">
              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
                <Tabs defaultValue="all" className="w-full sm:w-auto">
                  <TabsList>
                    <TabsTrigger value="all">All Documents</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    className={viewMode === 'grid' ? 'bg-[#0485ea]' : ''}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    className={viewMode === 'list' ? 'bg-[#0485ea]' : ''}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {viewMode === 'list' ? (
                <DocumentsTable 
                  documents={filteredDocuments}
                  loading={loading}
                  onViewDocument={handleViewDocument}
                  onDeleteDocument={handleDeleteDocument}
                />
              ) : (
                <DocumentGrid 
                  documents={filteredDocuments}
                  loading={loading}
                  onViewDocument={handleViewDocument}
                />
              )}
              
              {filteredDocuments.length === 0 && !loading && (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                  <h3 className="mt-4 text-lg font-medium">No documents found</h3>
                  <p className="text-muted-foreground mt-2">
                    {filters.search || filters.categories.length > 0 || filters.tags.length > 0 || filters.startDate || filters.endDate
                      ? "Try adjusting your filters or upload a new document."
                      : "Upload documents to get started."
                    }
                  </p>
                  <Button
                    className="mt-4 bg-[#0485ea]"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-72 space-y-4">
          <DocumentsFilter 
            filters={filters}
            onFiltersChange={updateFilters}
            entityType={entityType}
          />
        </div>
      </div>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        entityType={entityType}
        entityId={entityId}
        onSuccess={handleDocumentUploaded}
      />
      
      {/* Document Detail View */}
      <DocumentDetailView
        document={currentDocument}
        open={isDetailViewOpen}
        onClose={handleCloseDetailView}
        onDelete={handleDeleteDocument}
        onViewRelatedDocument={selectRelatedDocument}
      />
    </div>
  );
};

export default DocumentsSection;
