
import { useState, useEffect, useCallback } from 'react';
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { Document, EntityType } from '../schemas/documentSchema';

export interface DocumentFilters {
  search: string;
  category?: string;
  entityType?: EntityType;
  isExpense?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  sortBy: 'newest' | 'oldest' | 'name' | 'size';
}

export function useDocuments(initialFilters: DocumentFilters) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DocumentFilters>(initialFilters);
  
  // Count how many active filters we have for UI feedback
  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'sortBy') return count; // Don't count sort as a filter
    if (key === 'search' && value) return count + 1;
    if (key === 'dateRange' && value) return count + 1;
    if (value !== undefined && value !== null) return count + 1;
    return count;
  }, 0);
  
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Start building the query
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
      
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.from.toISOString())
          .lte('created_at', filters.dateRange.to.toISOString());
      }
      
      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'name':
          query = query.order('file_name', { ascending: true });
          break;
        case 'size':
          query = query.order('file_size', { ascending: false });
          break;
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (!data) {
        setDocuments([]);
        return;
      }
      
      // Add URLs to documents
      const docsWithUrls = await Promise.all(
        data.map(async (doc) => {
          if (doc.storage_path) {
            const { data: urlData } = await supabase.storage
              .from(DOCUMENTS_BUCKET_ID)
              .createSignedUrl(doc.storage_path, 300);
              
            if (urlData) {
              return {
                ...doc,
                url: urlData.signedUrl
              };
            }
          }
          
          return {
            ...doc,
            url: ''
          };
        })
      );
      
      setDocuments(docsWithUrls as Document[]);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message || 'An error occurred while fetching documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  // Fetch documents when filters change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof DocumentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);
  
  return {
    documents,
    loading,
    error,
    filters,
    activeFiltersCount,
    handleFilterChange,
    handleResetFilters,
    fetchDocuments
  };
}
