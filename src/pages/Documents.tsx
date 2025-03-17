
import React, { useState } from 'react';
import { Search, FileText, Plus, Filter, MoreHorizontal, ChevronDown, UploadCloud, Receipt, File } from 'lucide-react';
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
import DocumentUpload from '@/components/documents/DocumentUpload';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data for demonstration
const documentsData = [
  {
    id: 'DOC-1001',
    fileName: 'lumber_receipt.pdf',
    documentType: 'receipt',
    supplier: 'ABC Lumber Co',
    amount: 1250.75,
    date: '2023-09-15',
    projectId: 'PR-2001',
    uploadedBy: 'John Doe',
    uploadDate: '2023-09-16',
    tags: ['materials', 'lumber']
  },
  {
    id: 'DOC-1002',
    fileName: 'electrical_invoice.pdf',
    documentType: 'invoice',
    supplier: 'Johnson Electric',
    amount: 2800.00,
    date: '2023-09-10',
    projectId: 'PR-2001',
    uploadedBy: 'Jane Smith',
    uploadDate: '2023-09-11',
    tags: ['services', 'electrical']
  },
  {
    id: 'DOC-1003',
    fileName: 'paint_supplies.jpg',
    documentType: 'receipt',
    supplier: 'ColorWorld Paints',
    amount: 450.25,
    date: '2023-09-20',
    projectId: 'PR-2002',
    uploadedBy: 'John Doe',
    uploadDate: '2023-09-20',
    tags: ['materials', 'paint']
  },
  {
    id: 'DOC-1004',
    fileName: 'plumbing_service.pdf',
    documentType: 'invoice',
    supplier: 'Quality Plumbing Inc',
    amount: 1850.00,
    date: '2023-09-25',
    projectId: 'PR-2003',
    uploadedBy: 'Jane Smith',
    uploadDate: '2023-09-26',
    tags: ['services', 'plumbing']
  },
  {
    id: 'DOC-1005',
    fileName: 'concrete_delivery.jpg',
    documentType: 'receipt',
    supplier: 'FastCrete Solutions',
    amount: 3200.50,
    date: '2023-09-18',
    projectId: 'PR-2002',
    uploadedBy: 'John Doe',
    uploadDate: '2023-09-18',
    tags: ['materials', 'concrete']
  },
];

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const filteredDocuments = documentsData.filter(doc => {
    // Filter by search query
    const matchesSearch = 
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.projectId.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by document type
    const matchesTab = 
      selectedTab === 'all' || 
      (selectedTab === 'receipts' && doc.documentType === 'receipt') ||
      (selectedTab === 'invoices' && doc.documentType === 'invoice');
    
    return matchesSearch && matchesTab;
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const handleDocumentUploadSuccess = (data: any) => {
    console.log('Document uploaded:', data);
    setIsDialogOpen(false);
    // In a real app, we would update the state or trigger a refetch
  };
  
  const getDocumentTypeIcon = (type: string) => {
    return type === 'receipt' ? 
      <Receipt className="h-4 w-4 text-yellow-600" /> : 
      <File className="h-4 w-4 text-blue-600" />;
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-2 mb-6 animate-in">
            <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage supplier receipts and subcontractor invoices
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
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4 mr-1" />
                Filter
                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
              </Button>
              <Button 
                size="sm" 
                className="flex-1 md:flex-auto btn-premium"
                onClick={() => setIsDialogOpen(true)}
              >
                <UploadCloud className="h-4 w-4 mr-1" />
                Upload Document
              </Button>
            </div>
          </div>
          
          <Tabs 
            defaultValue="all" 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="animate-in"
            style={{ animationDelay: '0.15s' }}
          >
            <TabsList>
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="receipts">Receipts</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="premium-card mt-4 animate-in" style={{ animationDelay: '0.2s' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Supplier/Subcontractor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="font-medium">{doc.fileName}</div>
                      <div className="text-xs text-muted-foreground">{doc.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getDocumentTypeIcon(doc.documentType)}
                        <span className="capitalize">{doc.documentType}</span>
                      </div>
                    </TableCell>
                    <TableCell>{doc.supplier}</TableCell>
                    <TableCell>${doc.amount.toLocaleString()}</TableCell>
                    <TableCell>{formatDate(doc.date)}</TableCell>
                    <TableCell>{doc.projectId}</TableCell>
                    <TableCell>
                      <div>{formatDate(doc.uploadDate)}</div>
                      <div className="text-xs text-muted-foreground">by {doc.uploadedBy}</div>
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
                          <DropdownMenuItem>View document</DropdownMenuItem>
                          <DropdownMenuItem>Download</DropdownMenuItem>
                          <DropdownMenuItem>Edit details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Move to project</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete document</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDocuments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No documents found. Upload your first document!</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-0">
          <DocumentUpload 
            onSuccess={handleDocumentUploadSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Documents;
