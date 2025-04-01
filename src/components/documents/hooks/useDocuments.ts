
import { useState, useEffect, useCallback } from 'react';
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { Document, EntityType, DocumentCategory } from '../schemas/documentSchema';
import { DocumentFiltersState } from '../DocumentFilters';

export function useDocuments(initialFilters: DocumentFiltersState) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DocumentFiltersState>(initialFilters);
  
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
        if (filters.dateRange.from) {
          query = query.gte('created_at', filters.dateRange.from.toISOString());
        }
        if (filters.dateRange.to) {
          const endDate = new Date(filters.dateRange.to);
          endDate.setDate(endDate.getDate() + 1);
          query = query.lt('created_at', endDate.toISOString());
        }
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
              .getPublicUrl(doc.storage_path);
              
            if (urlData) {
              return {
                ...doc,
                url: urlData.publicUrl
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
  const handleFilterChange = useCallback((key: keyof DocumentFiltersState, value: any) => {
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
