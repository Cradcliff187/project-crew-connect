
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Document, EntityType, DocumentCategory } from '../schemas/documentSchema';
import { adaptDatabaseDocuments } from '@/utils/typeUtils';

interface DocumentFilters {
  search: string;
  category?: DocumentCategory;
  entityType?: EntityType;
  isExpense?: boolean;
  dateRange?: [Date | null, Date | null];
  sortBy?: 'newest' | 'oldest' | 'name';
}

export const useDocuments = (initialFilters: DocumentFilters) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DocumentFilters>(initialFilters);
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.entityType) count++;
    if (filters.isExpense !== undefined) count++;
    if (filters.dateRange && 
        (filters.dateRange[0] !== null || filters.dateRange[1] !== null)) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterKey: keyof DocumentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  }, []);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Fetch documents with applied filters
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query
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
        const [startDate, endDate] = filters.dateRange;
        
        if (startDate) {
          const formattedStartDate = startDate.toISOString();
          query = query.gte('created_at', formattedStartDate);
        }
        
        if (endDate) {
          const formattedEndDate = new Date(endDate);
          formattedEndDate.setHours(23, 59, 59, 999);
          query = query.lte('created_at', formattedEndDate.toISOString());
        }
      }
      
      // Apply sorting
      if (filters.sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (filters.sortBy === 'name') {
        query = query.order('file_name', { ascending: true });
      } else {
        // Default to newest
        query = query.order('created_at', { ascending: false });
      }
      
      // Execute query
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Process data: generate URLs and set as documents
      if (data) {
        // Use our helper function to adapt document types
        const adaptedDocuments = adaptDatabaseDocuments(data);
        setDocuments(adaptedDocuments);
      }
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch documents when filters change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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
