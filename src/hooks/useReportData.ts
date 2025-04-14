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

  // Fetch data using React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', selectedEntity, debouncedFilters],
    queryFn: () => fetchReportData(selectedEntity, debouncedFilters),
  });

  // Handle entity change
  const handleEntityChange = (entity: EntityType) => {
    setSelectedEntity(entity);
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    data,
    loading: isLoading,
    error: isError,
    selectedEntity,
    filters,
    handleEntityChange,
    handleFilterChange,
  };
};
