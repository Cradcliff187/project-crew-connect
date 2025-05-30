import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Document,
  DocumentCategory,
  EntityType,
} from '@/components/documents/schemas/documentSchema';

export interface DocumentFiltersState {
  search: string;
  category: DocumentCategory | undefined;
  entityType: EntityType | undefined;
  isExpense: boolean | undefined;
  dateRange: { from?: Date; to?: Date } | undefined;
  sortBy: string;
}

export const useDocuments = (initialFilters: DocumentFiltersState) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DocumentFiltersState>(initialFilters);
  const { toast } = useToast();

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' && value === 'newest') return false;
    if (key === 'search' && !value) return false;
    if (value === undefined) return false;
    return true;
  }).length;

  const fetchDocuments = async () => {
    setLoading(true);

    try {
      let query = supabase.from('documents').select('*');

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

      // Apply date range filter if set
      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }

      if (filters.dateRange?.to) {
        // Add one day to include the end date fully
        const endDate = new Date(filters.dateRange.to);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString());
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

      // Add URLs to documents
      const documentsWithUrls = await Promise.all(
        data.map(async doc => {
          if (doc.storage_path) {
            const { data: urlData, error: urlError } = await supabase.storage
              .from('construction_documents')
              .createSignedUrl(doc.storage_path, 3600); // 1 hour expiration

            if (urlError) {
              console.error('Error generating signed URL:', urlError);
              return { ...doc, url: null };
            }

            return { ...doc, url: urlData?.signedUrl || null };
          }
          return { ...doc, url: null };
        })
      );

      setDocuments(documentsWithUrls);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Failed to load documents',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: DocumentFiltersState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: undefined,
      entityType: undefined,
      isExpense: undefined,
      dateRange: undefined,
      sortBy: 'newest',
    });
  };

  // Fetch documents when filters change
  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  return {
    documents,
    loading,
    filters,
    activeFiltersCount,
    handleFilterChange,
    handleResetFilters,
    fetchDocuments,
  };
};
