// src/pages/Documents.tsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Eye, Archive, FolderOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import DocumentCard from '@/components/common/documents/DocumentCard';
import DocumentViewer from '@/components/documents/DocumentViewer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import DocumentViewToggle, { DocumentViewType } from '@/components/documents/DocumentViewToggle';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

// Use generated type alias
type DocumentRow = Database['public']['Tables']['documents']['Row'];

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [viewDocument, setViewDocument] = useState<DocumentRow | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewType, setViewType] = useState<DocumentViewType>('grid');
  const { user } = useAuth();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async (): Promise<DocumentRow[]> => {
      // Fetch documents using generated types
      const { data, error } = await supabase.from('documents').select('*');
      if (error) throw error;
      return (data as DocumentRow[]) || [];
    },
  });

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return documents
      .filter(doc => doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(doc => (filterEntityType === 'ALL' ? true : doc.entity_type === filterEntityType))
      .filter(doc => (filterCategory === 'ALL' ? true : doc.category === filterCategory));
  }, [documents, searchTerm, filterEntityType, filterCategory]);

  const entityTypes = useMemo(() => {
    if (!documents) return ['ALL'];
    const types = new Set(documents.map(doc => doc.entity_type).filter(Boolean));
    return ['ALL', ...Array.from(types)];
  }, [documents]);

  const categories = useMemo(() => {
    if (!documents) return ['ALL'];
    const cats = new Set(documents.map(doc => doc.category || 'Uncategorized').filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [documents]);

  // Calculate metrics for summary cards
  const totalDocuments = documents?.length || 0;
  const recentUploads =
    documents?.filter(doc => {
      if (!doc.created_at) return false;
      const created = new Date(doc.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }).length || 0;
  const totalCategories = categories.length - 1; // Subtract 'ALL'
  const totalEntityTypes = entityTypes.length - 1; // Subtract 'ALL'

  const renderDocumentGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredDocuments.map(doc => (
        <DocumentCard
          key={doc.document_id}
          document={doc}
          onViewDocument={() => setViewDocument(doc)}
        />
      ))}
    </div>
  );

  const renderDocumentList = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-montserrat">Name</TableHead>
              <TableHead className="font-montserrat">Type</TableHead>
              <TableHead className="font-montserrat">Category</TableHead>
              <TableHead className="font-montserrat">Entity</TableHead>
              <TableHead className="font-montserrat">Created</TableHead>
              <TableHead className="font-montserrat">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map(doc => (
              <TableRow key={doc.document_id}>
                <TableCell className="font-opensans">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    {doc.file_name}
                  </div>
                </TableCell>
                <TableCell className="font-opensans">{doc.file_type || 'Unknown'}</TableCell>
                <TableCell className="font-opensans">
                  <Badge variant="outline" className="font-opensans">
                    {doc.category || 'Uncategorized'}
                  </Badge>
                </TableCell>
                <TableCell className="font-opensans">{doc.entity_type}</TableCell>
                <TableCell className="font-opensans">
                  {doc.created_at ? formatDate(doc.created_at) : 'Unknown'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewDocument(doc)}
                    className="font-opensans"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center font-montserrat">
              <FileText className="h-8 w-8 mr-3 text-blue-600" />
              Document Management
            </h1>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 font-opensans"
              >
                {user?.role || 'User'}
              </Badge>
              <Button
                size="sm"
                onClick={() => setIsUploadOpen(true)}
                className="bg-[#0485ea] hover:bg-[#0375d1] font-opensans"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>
          </div>
          <p className="text-gray-600 font-opensans">Manage and organize all project documents</p>
        </div>

        {/* Summary Cards - Horizontal Layout for Desktop */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium font-opensans">Total Documents</p>
                  <p className="text-2xl font-bold text-blue-900 font-montserrat">
                    {totalDocuments}
                  </p>
                </div>
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium font-opensans">Recent Uploads</p>
                  <p className="text-2xl font-bold text-green-900 font-montserrat">
                    {recentUploads}
                  </p>
                </div>
                <Upload className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium font-opensans">Categories</p>
                  <p className="text-2xl font-bold text-purple-900 font-montserrat">
                    {totalCategories}
                  </p>
                </div>
                <FolderOpen className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium font-opensans">Entity Types</p>
                  <p className="text-2xl font-bold text-yellow-900 font-montserrat">
                    {totalEntityTypes}
                  </p>
                </div>
                <Archive className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Maximum Space for Document Data */}
        <PageTransition>
          <div className="space-y-4">
            {/* Filters and View Toggle */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="max-w-sm font-opensans"
                />
                <Select value={filterEntityType} onValueChange={setFilterEntityType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map(type => (
                      <SelectItem key={type} value={type} className="font-opensans">
                        {type === 'ALL' ? 'All Types' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="font-opensans">
                        {cat === 'ALL' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DocumentViewToggle viewType={viewType} onViewTypeChange={setViewType} />
            </div>

            {/* Document Display */}
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDocuments.length > 0 ? (
              viewType === 'grid' ? (
                renderDocumentGrid()
              ) : (
                renderDocumentList()
              )
            ) : (
              <div className="text-center py-10 border rounded-md">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground font-opensans">
                  No documents found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </PageTransition>

        {/* Document Viewer Dialog */}
        {viewDocument && (
          <DocumentViewer
            document={viewDocument}
            open={!!viewDocument}
            onOpenChange={open => !open && setViewDocument(null)}
          />
        )}

        {/* Upload Dialog */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-montserrat">Upload New Document</DialogTitle>
              <DialogDescription>
                Select and upload a new document to the system. You can categorize it by type and
                entity.
              </DialogDescription>
            </DialogHeader>
            <EnhancedDocumentUpload
              onSuccess={() => {
                setIsUploadOpen(false);
                // Refetch documents if needed
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Documents;
