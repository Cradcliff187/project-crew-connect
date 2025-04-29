// src/pages/Documents.tsx
import React, { useState, useMemo } from 'react';
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
import { Loader2, FileText } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import PageHeader from '@/components/common/layout/PageHeader';
import DocumentCard from '@/components/common/documents/DocumentCard';
import DocumentViewer from '@/components/common/documents/DocumentViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';

// Use generated type alias
type DocumentRow = Database['public']['Tables']['documents']['Row'];

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [viewDocument, setViewDocument] = useState<DocumentRow | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data: documents, isLoading } = useQuery<DocumentRow[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      // Fetch documents using generated types
      const { data, error } = await supabase
        .from('documents_with_urls') // Assuming view exists and returns DocumentRow compatible data
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const filteredDocuments = useMemo(() => {
    return (documents ?? [])
      .filter(doc => doc.file_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(doc => (filterEntityType === 'ALL' ? true : doc.entity_type === filterEntityType))
      .filter(doc => (filterCategory === 'ALL' ? true : doc.category === filterCategory));
  }, [documents, searchTerm, filterEntityType, filterCategory]);

  const entityTypes = useMemo(() => {
    const types = new Set(documents?.map(doc => doc.entity_type) || []);
    return ['ALL', ...Array.from(types)];
  }, [documents]);

  const categories = useMemo(() => {
    const cats = new Set(documents?.map(doc => doc.category || 'Uncategorized') || []);
    return ['ALL', ...Array.from(cats)];
  }, [documents]);

  return (
    <PageTransition>
      <div className="space-y-4">
        <PageHeader title="Documents" actions={null /* Add upload button here if needed */} />

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterEntityType} onValueChange={setFilterEntityType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type..." />
            </SelectTrigger>
            <SelectContent>
              {entityTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {' '}
                  {type === 'ALL' ? 'All Types' : type}{' '}
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
                <SelectItem key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(doc => (
              <DocumentCard
                key={doc.document_id}
                document={doc} // Type should match
                onViewDocument={() => setViewDocument(doc)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border rounded-md">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No documents found matching your criteria.</p>
          </div>
        )}
      </div>

      <Dialog open={!!viewDocument} onOpenChange={open => !open && setViewDocument(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{viewDocument?.file_name}</DialogTitle>
          </DialogHeader>
          {viewDocument && (
            <DocumentViewer
              document={viewDocument} // Type should match
              open={!!viewDocument}
              onOpenChange={open => !open && setViewDocument(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Consider adding a floating action button or similar for upload if not in header */}
      {/* <Button
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsUploadOpen(true)}
      >
        Upload New Document
      </Button> */}
    </PageTransition>
  );
};

export default Documents;
