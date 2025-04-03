
import { useState, useCallback, useMemo } from 'react';
import { Document } from '../schemas/documentSchema';

export interface DocumentFilterState {
  search: string;
  startDate: Date | null;
  endDate: Date | null;
  categories: string[];
  tags: string[];
}

const defaultFilters: DocumentFilterState = {
  search: '',
  startDate: null,
  endDate: null,
  categories: [],
  tags: []
};

const useDocumentFilters = (documents: Document[]) => {
  const [filters, setFilters] = useState<DocumentFilterState>(defaultFilters);

  const updateFilters = useCallback((newFilters: Partial<DocumentFilterState>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Search filter
      if (filters.search && !matchesSearch(doc, filters.search.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filters.categories.length > 0 && doc.category && !filters.categories.includes(doc.category)) {
        return false;
      }
      
      // Tags filter
      if (filters.tags.length > 0 && doc.tags) {
        const docTags = doc.tags || [];
        if (!filters.tags.some(tag => docTags.includes(tag))) {
          return false;
        }
      }
      
      // Date range filter
      const docDate = new Date(doc.created_at);
      if (filters.startDate && docDate < filters.startDate) {
        return false;
      }
      if (filters.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (docDate > endOfDay) {
          return false;
        }
      }
      
      return true;
    });
  }, [documents, filters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    filteredDocuments
  };
};

// Helper function to check if a document matches the search query
const matchesSearch = (document: Document, searchQuery: string): boolean => {
  // Match file name
  if (document.file_name.toLowerCase().includes(searchQuery)) {
    return true;
  }
  
  // Match category
  if (document.category && document.category.toLowerCase().includes(searchQuery)) {
    return true;
  }
  
  // Match tags
  if (document.tags && document.tags.some(tag => tag.toLowerCase().includes(searchQuery))) {
    return true;
  }
  
  // Match notes
  if (document.notes && document.notes.toLowerCase().includes(searchQuery)) {
    return true;
  }
  
  return false;
};

export default useDocumentFilters;
