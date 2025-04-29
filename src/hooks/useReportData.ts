import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EntityType, ReportFilters } from '@/types/reports';
import { fetchReportData } from '@/utils/reportUtils';

export const useReportData = (initialEntity: EntityType) => {
  const [selectedEntity, setSelectedEntity] = useState<EntityType>(initialEntity);
  const [filters, setFilters] = useState<ReportFilters>({
    search: '',
    dateRange: undefined,
    status: 'all',
  });
  const [debouncedFilters, setDebouncedFilters] = useState<ReportFilters>(filters);

  // Debounce the filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Fetch data using React Query with better error handling
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reports', selectedEntity, debouncedFilters],
    queryFn: () => fetchReportData(selectedEntity, debouncedFilters),
    // Add retry logic to handle temporary errors
    retry: 1,
  });

  // Log errors but don't block UI
  useEffect(() => {
    if (error) {
      console.error(`Error in report query for ${selectedEntity}:`, error);
    }
  }, [error, selectedEntity]);

  // Handle entity change
  const handleEntityChange = (entity: EntityType) => {
    setSelectedEntity(entity);
    // Reset filters when changing entity type
    setFilters({
      search: '',
      dateRange: undefined,
      status: 'all',
      role: 'all',
    });
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    data,
    loading: isLoading,
    error: isError,
    errorDetails: error,
    selectedEntity,
    filters,
    handleEntityChange,
    handleFilterChange,
  };
};
