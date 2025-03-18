import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Download, Trash2, Eye, MoreVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import DocumentFilters from '@/components/documents/DocumentFilters';
import DocumentCard from '@/components/documents/DocumentCard';
import { Document, DocumentCategory, EntityType } from '@/components/documents/schemas/documentSchema';
import { formatDate } from '@/lib/utils';

const DocumentsPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(!isMobile);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: undefined as DocumentCategory | undefined,
    entityType: undefined as EntityType | undefined,
    isExpense: undefined as boolean | undefined,
    sortBy: 'newest'
  });

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' && value === 'newest') return false;
    if (key === 'search' && !value) return false;
    return value !== undefined;
  }).length;

  // Fetch documents on load and when filters change
  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  const fetchDocuments = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from('documents')
        .select('*');

      // Apply filters
      if (filters.search) {
        query = query.ilike('file_name', `%${filters.search}%`);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters.isExpense !== undefined) {
        query = query.eq('is_expense', filters.isExpense);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'name_asc':
          query = query.order('file_name', { ascending: true });
          break;
        case 'name_desc':
          query = query.order('file_name', { ascending: false });
          break;
        case 'size_asc':
          query = query.order('file_size', { ascending: true });
          break;
        case 'size_desc':
          query = query.order('file_size', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Get document URLs
      const docsWithUrls = await Promise.all(data.map(async (doc) => {
        const { data: { publicUrl } } = supabase.storage
          .from('construction_documents')
          .getPublicUrl(doc.storage_path);
        
        return { ...doc, url: publicUrl };
      }));

      setDocuments(docsWithUrls);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Failed to load documents",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setIsDetailOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('construction_documents')
        .remove([selectedDocument.storage_path]);
        
      if (storageError) throw storageError;
      
      // Then delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', selectedDocument.document_id);
        
      if (dbError) throw dbError;
      
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted."
      });
      
      fetchDocuments();
      setIsDeleteOpen(false);
      setSelectedDocument(null);
      
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Failed to delete document",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: undefined,
      entityType: undefined,
      isExpense: undefined,
      sortBy: 'newest'
    });
  };

  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    fetchDocuments();
    toast({
      title: "Document uploaded",
      description: "Your document has been successfully uploaded."
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  return (
    <PageTransition>
      <div className="container py-4 md:py-6 space-y-6">
        {/* Header with Search and Upload button */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold text-[#0485ea]">Documents</h1>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  className="pl-8"
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>
            )}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Search Documents</SheetTitle>
                  </SheetHeader>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      className="pl-8"
                      value={filters.search}
                      onChange={handleSearchChange}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader className="mb-4">
                    <SheetTitle>Filter Documents</SheetTitle>
                  </SheetHeader>
                  <DocumentFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                    activeFiltersCount={activeFiltersCount}
                  />
                </SheetContent>
              </Sheet>
            )}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#0485ea] hover:bg-[#0375d1]" size={isMobile ? "icon" : "default"}>
                  <Plus className="h-4 w-4" />
                  {!isMobile && <span>Add Document</span>}
                </Button>
              </DialogTrigger>
              <DialogContent className={isMobile ? "w-[95vw] max-w-[600px]" : "sm:max-w-[600px]"}>
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload and categorize a new document to your system.
                  </DialogDescription>
                </DialogHeader>
                <EnhancedDocumentUpload 
                  entityType="PROJECT" 
                  onSuccess={handleUploadSuccess}
                  onCancel={() => setIsUploadOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Filters Panel - Desktop Only */}
          <div className="hidden lg:block">
            <DocumentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>

          {/* Documents Content Area */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              // Loading state
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              // Empty state
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
                  <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                      <Button className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                          Upload a new document to your system.
                        </DialogDescription>
                      </DialogHeader>
                      <EnhancedDocumentUpload 
                        entityType="PROJECT" 
                        onSuccess={handleUploadSuccess}
                        onCancel={() => setIsUploadOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden grid grid-cols-1 gap-3">
                  {documents.map((document) => (
                    <DocumentCard
                      key={document.document_id}
                      document={document}
                      onView={() => handleDocumentSelect(document)}
                      onDelete={() => {
                        setSelectedDocument(document);
                        setIsDeleteOpen(true);
                      }}
                    />
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block relative overflow-x-auto shadow-md sm:rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((document) => (
                        <TableRow key={document.document_id}>
                          <TableCell className="font-medium">{document.file_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {document.category || 'Other'}
                            </Badge>
                          </TableCell>
                          <TableCell>{document.entity_type.replace('_', ' ').toLowerCase()}</TableCell>
                          <TableCell>{formatDate(document.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDocumentSelect(document)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    if (document.url) {
                                      window.open(document.url, '_blank');
                                    }
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedDocument(document);
                                    setIsDeleteOpen(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Document Detail Dialog */}
        {selectedDocument && (
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>{selectedDocument.file_name}</DialogTitle>
                <DialogDescription>
                  Uploaded on {formatDate(selectedDocument.created_at)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedDocument.url && (
                  <div className="border rounded-md overflow-hidden h-[300px] max-h-[60vh]">
                    {selectedDocument.file_type?.startsWith('image/') ? (
                      <img
                        src={selectedDocument.url}
                        alt={selectedDocument.file_name}
                        className="w-full h-full object-contain"
                      />
                    ) : selectedDocument.file_type?.includes('pdf') ? (
                      <iframe
                        src={selectedDocument.url}
                        title={selectedDocument.file_name}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center">
                          <p>Preview not available</p>
                          <Button 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => window.open(selectedDocument.url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm">{selectedDocument.category || 'Other'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Entity Type</p>
                    <p className="text-sm">{selectedDocument.entity_type.replace('_', ' ').toLowerCase()}</p>
                  </div>
                  {selectedDocument.entity_id && (
                    <div>
                      <p className="text-sm font-medium">Entity ID</p>
                      <p className="text-sm">{selectedDocument.entity_id}</p>
                    </div>
                  )}
                  {selectedDocument.is_expense && (
                    <>
                      <div>
                        <p className="text-sm font-medium">Expense</p>
                        <p className="text-sm">Yes</p>
                      </div>
                      {selectedDocument.amount && (
                        <div>
                          <p className="text-sm font-medium">Amount</p>
                          <p className="text-sm">${selectedDocument.amount.toFixed(2)}</p>
                        </div>
                      )}
                      {selectedDocument.expense_date && (
                        <div>
                          <p className="text-sm font-medium">Expense Date</p>
                          <p className="text-sm">{formatDate(selectedDocument.expense_date)}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {selectedDocument.notes && (
                  <div>
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm">{selectedDocument.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-4">
                <Button 
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Close
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedDocument.url) {
                        window.open(selectedDocument.url, '_blank');
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsDetailOpen(false);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Document</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this document? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteDocument}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default DocumentsPage;
