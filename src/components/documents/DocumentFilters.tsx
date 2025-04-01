import React from 'react';
import { Search, Filter, Calendar, Tags, ArrowDownWideNarrow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { EntityType, DocumentCategory } from './schemas/documentSchema';
import { DocumentFiltersState } from './hooks/useDocuments';

// Available entity types for filtering
const entityTypes = [
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'PROJECT', label: 'Project' },
  { value: 'WORK_ORDER', label: 'Work Order' },
  { value: 'ESTIMATE', label: 'Estimate' },
  { value: 'ESTIMATE_ITEM', label: 'Estimate Item' },
  { value: 'TIME_ENTRY', label: 'Time Entry' },
];

// Available document categories for filtering
const documentCategories: { value: DocumentCategory; label: string }[] = [
  { value: 'other', label: 'Other' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
  { value: '3rd_party_estimate', label: '3rd Party Estimate' },
  { value: 'contract', label: 'Contract' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'certification', label: 'Certification' },
  { value: 'photo', label: 'Photo' },
];

// Available sort options
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'size_asc', label: 'Size (Small to Large)' },
  { value: 'size_desc', label: 'Size (Large to Small)' },
];

interface DocumentFiltersProps {
  filters: DocumentFiltersState;
  activeFiltersCount: number;
  onFilterChange: (key: keyof DocumentFiltersState, value: any) => void;
  onResetFilters: () => void;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  activeFiltersCount,
  onFilterChange,
  onResetFilters,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange('search', e.target.value);
  };

  const handleCategoryChange = (value: DocumentCategory) => {
    onFilterChange('category', value);
  };

  const handleEntityTypeChange = (value: EntityType) => {
    onFilterChange('entityType', value);
  };

  const handleExpenseChange = (value: string) => {
    onFilterChange('isExpense', value === 'true' ? true : value === 'false' ? false : undefined);
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFilterChange('dateRange', { ...filters.dateRange, from: date });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFilterChange('dateRange', { ...filters.dateRange, to: date });
  };

  const handleSortChange = (value: string) => {
    onFilterChange('sortBy', value);
  };

  const getFilterLabel = (key: keyof DocumentFiltersState): string => {
    switch (key) {
      case 'category':
        return documentCategories.find(cat => cat.value === filters.category)?.label || 'Category';
      case 'entityType':
        return entityTypes.find(et => et.value === filters.entityType)?.label || 'Entity Type';
      case 'isExpense':
        return filters.isExpense === true ? 'Expense: Yes' : filters.isExpense === false ? 'Expense: No' : 'Expense';
      case 'dateRange':
        if (filters.dateRange?.from && filters.dateRange?.to) {
          return `${format(filters.dateRange.from, 'MMM d, yyyy')} - ${format(filters.dateRange.to, 'MMM d, yyyy')}`;
        } else if (filters.dateRange?.from) {
          return `From ${format(filters.dateRange.from, 'MMM d, yyyy')}`;
        } else if (filters.dateRange?.to) {
          return `Until ${format(filters.dateRange.to, 'MMM d, yyyy')}`;
        }
        return 'Date Range';
      default:
        return '';
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="filters">
        <AccordionTrigger className="data-[state=open]:text-foreground">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by file name..."
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select onValueChange={handleCategoryChange} defaultValue={filters.category || ''}>
                <SelectTrigger>
                  <SelectValue placeholder={getFilterLabel('category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {documentCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Entity Type</Label>
              <Select onValueChange={handleEntityTypeChange} defaultValue={filters.entityType || ''}>
                <SelectTrigger>
                  <SelectValue placeholder={getFilterLabel('entityType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Entity Types</SelectItem>
                  {entityTypes.map((entityType) => (
                    <SelectItem key={entityType.value} value={entityType.value}>
                      {entityType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Is Expense</Label>
              <Select onValueChange={handleExpenseChange} defaultValue={filters.isExpense === undefined ? '' : filters.isExpense.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder={getFilterLabel('isExpense')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={
                      "w-full justify-start text-left font-normal" +
                      (filters.dateRange?.from || filters.dateRange?.to
                        ? ""
                        : " text-muted-foreground")
                    }
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{getFilterLabel('dateRange')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                  <div className="flex space-x-2">
                    <div>
                      <Label className="text-xs">From</Label>
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateRange?.from}
                        onSelect={handleDateFromChange}
                        className="rounded-md border"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">To</Label>
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateRange?.to}
                        onSelect={handleDateToChange}
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button variant="link" size="sm" className="mt-4" onClick={onResetFilters}>
            Reset Filters
          </Button>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="sort">
        <AccordionTrigger className="data-[state=open]:text-foreground">
          <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
          Sort By
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <Select onValueChange={handleSortChange} defaultValue={filters.sortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
