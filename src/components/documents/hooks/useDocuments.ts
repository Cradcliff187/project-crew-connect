
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '../schemas/documentSchema';
import { DocumentFilterValues } from '../DocumentFilter';
import { DateRange } from 'react-day-picker';
import { toast } from '@/hooks/use-toast';

interface DocumentFilters extends DocumentFilterValues {
  search: string;
}

export const useDocuments = (initialFilters: DocumentFilters) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DocumentFilters>(initialFilters);

  // Calculate the number of active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search?.trim()) count++;
    if (filters.category) count++;
    if (filters.entityType) count++;
    if (filters.dateRange?.from) count++;
    if (filters.isExpense !== undefined) count++;
    if (filters.sortBy && filters.sortBy !== 'newest') count++;
    return count;
  }, [filters]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Start building the query
      let query = supabase
        .from('documents')
        .select('*');
      
      // Add filters
      if (filters.search?.trim()) {
        query = query.or(`file_name.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
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
      
      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
        
        if (filters.dateRange.to) {
          // Add one day to the end date to include the whole day
          const endDate = new Date(filters.dateRange.to);
          endDate.setDate(endDate.getDate() + 1);
          query = query.lt('created_at', endDate.toISOString());
        }
      }
      
      // Add sorting
      if (filters.sortBy) {
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
      } else {
        // Default sort by newest
        query = query.order('created_at', { ascending: false });
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Process the documents to get signed URLs
      const processedDocuments: Document[] = await Promise.all(
        data.map(async (doc) => {
          let url = '';
          if (doc.storage_path) {
            try {
              const { data: urlData, error: urlError } = await supabase.storage
                .from('construction_documents')
                .createSignedUrl(doc.storage_path, 300, {
                  transform: {
                    width: 400,
                    height: 400,
                    quality: 80
                  }
                });
              
              if (!urlError) {
                url = urlData.signedUrl;
              }
            } catch (error) {
              console.error('Error generating URL:', error);
            }
          }
          
          return {
            ...doc,
            url
          };
        })
      );
      
      setDocuments(processedDocuments);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  // Fetch documents when filters change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: DocumentFilters) => {
    setFilters(newFilters);
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: undefined,
      entityType: undefined,
      dateRange: undefined,
      isExpense: undefined,
      sortBy: 'newest'
    });
  };
  
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
};
