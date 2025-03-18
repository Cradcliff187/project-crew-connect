
import React, { useState, useEffect } from 'react';
import { Search, FileText, Plus, Filter, MoreHorizontal, ChevronDown, UploadCloud, Receipt, File, Loader2, FileImage, FileContract, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageTransition from '@/components/layout/PageTransition';
import Header from '@/components/layout/Header';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import DocumentFilters, { DocumentFiltersState } from '@/components/documents/DocumentFilters';
import { Document } from '@/components/documents/schemas/documentSchema';
import { format, parseISO } from 'date-fns';

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<DocumentFiltersState>({
    search: '',
    category: null,
    entityType: null,
    dateRange: null,
    showExpensesOnly: false,
  });
  
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get public URLs for all documents
      const docsWithUrls = await Promise.all((data || []).map(async (doc) => {
        const { data: { publicUrl } } = supabase.storage
          .from('construction_documents')
          .getPublicUrl(doc.storage_path);
        
        return {
          ...doc,
          url: publicUrl
        };
      }));

      setDocuments(docsWithUrls);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (documentId: string, storagePath: string) => {
    try {
      // First delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('construction_documents')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Then delete the database record
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', documentId);

      if (dbError) throw dbError;

      // Update the local state
      setDocuments(documents.filter(doc => doc.document_id !== documentId));

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (newFilters: Partial<DocumentFiltersState>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: null,
      entityType: null,
      dateRange: null,
      showExpensesOnly: false,
    });
    setSearchQuery('');
  };

  // Count active filters for UI indicator
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.entityType) count++;
    if (filters.dateRange) count++;
    if (filters.showExpensesOnly) count++;
    if (searchQuery) count++;
    return count;
  };
  
  const filteredDocuments = documents.filter(doc => {
    // Filter by search query
    const matchesSearch = 
      !searchQuery || 
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.entity_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.entity_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    // Filter by document type (tab)
    const matchesTab = 
      selectedTab === 'all' || 
      (selectedTab === 'receipts' && (doc.category === 'receipt' || (doc.tags && doc.tags.includes('receipt')))) ||
      (selectedTab === 'invoices' && (doc.category === 'invoice' || (doc.tags && doc.tags.includes('invoice')))) ||
      (selectedTab === 'estimates' && (doc.category === 'estimate' || (doc.tags && doc.tags.includes('estimate'))));
    
    // Filter by document category
    const matchesCategory = !filters.category || 
      doc.category === filters.category || 
      (doc.tags && doc.tags.includes(filters.category));

    // Filter by entity type
    const matchesEntityType = !filters.entityType || doc.entity_type === filters.entityType;

    // Filter by date range
    const matchesDateRange = !filters.dateRange || !filters.dateRange.from || 
      (doc.created_at && 
        (parseISO(doc.created_at) >= filters.dateRange.from) && 
        (!filters.dateRange.to || parseISO(doc.created_at) <= filters.dateRange.to));

    // Filter by expense flag
    const matchesExpenseFilter = !filters.showExpensesOnly || 
      doc.is_expense === true || 
      (doc.tags && doc.tags.includes('expense'));
    
    return matchesSearch && matchesTab && matchesCategory && matchesEntityType && matchesDateRange && matchesExpenseFilter;
  });
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const handleDocumentUploadSuccess = (data: any) => {
    setIsDialogOpen(false);
    fetchDocuments(); // Refresh the documents list
  };
  
  const getDocumentTypeIcon = (doc: Document) => {
    const category = doc.category || 
      (doc.tags && doc.tags.find(tag => ['receipt', 'invoice', 'estimate', 'contract', 'photo'].includes(tag)));
    
    switch (category) {
      case 'receipt':
        return <Receipt className="h-4 w-4 text-amber-600" />;
      case 'invoice':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'estimate':
        return <FileText className="h-4 w-4 text-emerald-600" />;
      case 'contract':
        return <FileContract className="h-4 w-4 text-purple-600" />;
      case 'photo':
        return <FileImage className="h-4 w-4 text-indigo-600" />;
      default:
        return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDocumentType = (doc: Document) => {
    const category = doc.category || 
      (doc.tags && doc.tags.find(tag => ['receipt', 'invoice', 'estimate', 'contract', 'photo'].includes(tag)));
    
    if (category) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
    return 'Document';
  };
  
  const formatEntityType = (type: string) => {
    if (!type) return '';
    return type.charAt(0) + type.slice(1).toLowerCase();
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-2 mb-6 animate-in">
            <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage invoices, receipts, estimates and other project documents
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
            <div className="relative w-full md:w-auto flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search documents..." 
                className="pl-9 subtle-input rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button 
                size="sm" 
                className="flex-1 md:flex-auto bg-[#0485ea] hover:bg-[#0485ea]/90 text-white"
                onClick={() => setIsDialogOpen(true)}
              >
                <UploadCloud className="h-4 w-4 mr-1" />
                Upload Document
              </Button>
            </div>
          </div>
          
          <div className="mb-4 animate-in" style={{ animationDelay: '0.15s' }}>
            <DocumentFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={resetFilters}
              activeFiltersCount={getActiveFiltersCount()}
            />
          </div>

          <Tabs 
            defaultValue="all" 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="animate-in mt-4"
            style={{ animationDelay: '0.15s' }}
          >
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="estimates">Estimates</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="premium-card mt-4 animate-in" style={{ animationDelay: '0.2s' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Related To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {filteredDocuments.length > 0 ? (
                      filteredDocuments.map((doc) => (
                        <TableRow key={doc.document_id}>
                          <TableCell>
                            <div className="font-medium">{doc.file_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {doc.notes && <span className="italic">"{doc.notes.substring(0, 40)}{doc.notes.length > 40 ? '...' : ''}"</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getDocumentTypeIcon(doc)}
                              <span className="capitalize">{getDocumentType(doc)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatEntityType(doc.entity_type)}</div>
                            <div className="text-xs text-muted-foreground">{doc.entity_id}</div>
                          </TableCell>
                          <TableCell>
                            {doc.amount ? (
                              <div className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                                ${doc.amount.toFixed(2)}
                              </div>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            {doc.version || "1"}
                          </TableCell>
                          <TableCell>
                            <div>{formatDate(doc.created_at)}</div>
                            <div className="text-xs text-muted-foreground">by {doc.uploaded_by || 'Unknown'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {doc.tags && doc.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {doc.is_expense && (
                                <Badge variant="default" className="text-xs bg-green-600">
                                  Expense
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                    View document
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={doc.url} download={doc.file_name}>
                                    Download
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => deleteDocument(doc.document_id, doc.storage_path)}
                                  className="text-red-600"
                                >
                                  Delete document
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                          <p>No documents found. Upload your first document!</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-0">
          <EnhancedDocumentUpload 
            onSuccess={handleDocumentUploadSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Documents;

