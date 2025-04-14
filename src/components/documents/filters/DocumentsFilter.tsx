import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DateRangeFilter from './DateRangeFilter';
import CategoryFilter from './CategoryFilter';
import TagsFilter from './TagsFilter';
import { EntityType } from '../schemas/documentSchema';
import { DocumentFilterState } from '../hooks/useDocumentFilters';

interface DocumentsFilterProps {
  filters: DocumentFilterState;
  onFiltersChange: (filters: Partial<DocumentFilterState>) => void;
  entityType?: EntityType;
}

const DocumentsFilter: React.FC<DocumentsFilterProps> = ({
  filters,
  onFiltersChange,
  entityType,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value });
  };

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    onFiltersChange({ startDate, endDate });
  };

  const handleCategoryChange = (categories: string[]) => {
    onFiltersChange({ categories });
  };

  const handleTagsChange = (tags: string[]) => {
    onFiltersChange({ tags });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      startDate: null,
      endDate: null,
      categories: [],
      tags: [],
    });
  };

  const hasActiveFilters = () => {
    return (
      !!filters.search ||
      !!filters.startDate ||
      !!filters.endDate ||
      filters.categories.length > 0 ||
      filters.tags.length > 0
    );
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center relative">
          <Search className="h-4 w-4 absolute left-2.5 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 h-full"
              onClick={() => onFiltersChange({ search: '' })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CategoryFilter
          selectedCategories={filters.categories}
          onCategoryChange={handleCategoryChange}
          entityType={entityType}
        />

        <TagsFilter selectedTags={filters.tags} onTagsChange={handleTagsChange} />

        <DateRangeFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
          onDateRangeChange={handleDateRangeChange}
        />

        {hasActiveFilters() && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={clearAllFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsFilter;
