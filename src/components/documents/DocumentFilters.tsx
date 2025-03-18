
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { documentCategories, EntityType, entityTypes } from './schemas/documentSchema';
import { Badge } from '@/components/ui/badge';

export interface DocumentFiltersState {
  search: string;
  category: string | null;
  entityType: EntityType | null;
  dateRange: DateRange | null;
  showExpensesOnly: boolean;
}

interface DocumentFiltersProps {
  filters: DocumentFiltersState;
  onFilterChange: (filters: Partial<DocumentFiltersState>) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
}

const DocumentFilters = ({ 
  filters, 
  onFilterChange, 
  onResetFilters,
  activeFiltersCount 
}: DocumentFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={filters.category || ""}
        onValueChange={(value) => onFilterChange({ category: value || null })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Document Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          {documentCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.entityType || ""}
        onValueChange={(value) => onFilterChange({ entityType: value as EntityType || null })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Related To" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Relations</SelectItem>
          {entityTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange?.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                  {format(filters.dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(filters.dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={filters.dateRange?.from}
            selected={filters.dateRange || undefined}
            onSelect={(range) => onFilterChange({ dateRange: range })}
            numberOfMonths={2}
          />
          <div className="p-2 border-t border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onFilterChange({ dateRange: null })}
              className="w-full"
            >
              Clear Date Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button 
        variant="outline" 
        className={filters.showExpensesOnly ? "bg-[#0485ea]/10 border-[#0485ea]" : ""}
        onClick={() => onFilterChange({ showExpensesOnly: !filters.showExpensesOnly })}
      >
        Expenses Only
      </Button>

      {activeFiltersCount > 0 && (
        <Button variant="ghost" onClick={onResetFilters} size="sm">
          Clear Filters
          <Badge className="ml-2 bg-[#0485ea]">{activeFiltersCount}</Badge>
        </Button>
      )}
    </div>
  );
};

export default DocumentFilters;
