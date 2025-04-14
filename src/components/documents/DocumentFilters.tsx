import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import DocumentFilter, { DocumentFilterValues } from './DocumentFilter';

interface DocumentFiltersProps {
  filters: DocumentFilterValues & { search: string };
  onFilterChange: (filters: DocumentFilterValues & { search: string }) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  activeFiltersCount,
}) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: event.target.value });
  };

  const handleFilterChange = (filterValues: DocumentFilterValues) => {
    onFilterChange({ ...filters, ...filterValues });
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-8"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>

            {activeFiltersCount > 0 && (
              <Button variant="ghost" onClick={onReset} className="h-10 px-3">
                Clear Filters ({activeFiltersCount})
              </Button>
            )}
          </div>

          <DocumentFilter value={filters} onChange={handleFilterChange} />
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentFilters;
