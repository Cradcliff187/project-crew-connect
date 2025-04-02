
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type DocumentFilterValues = {
  category?: string;
  entityType?: string;
  dateRange?: DateRange | undefined;
  isExpense?: boolean;
  sortBy?: 'newest' | 'oldest' | 'name' | 'size';
};

interface DocumentFilterProps {
  value: DocumentFilterValues;
  onChange: (value: DocumentFilterValues) => void;
  label?: string;
  className?: string;
}

const DocumentFilter: React.FC<DocumentFilterProps> = ({
  value,
  onChange,
  label,
  className
}) => {
  const handleCategoryChange = (category: string) => {
    onChange({ ...value, category: category || undefined });
  };

  const handleEntityTypeChange = (entityType: string) => {
    onChange({ ...value, entityType: entityType || undefined });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onChange({ ...value, dateRange: range });
  };

  const handleSortByChange = (sortBy: string) => {
    onChange({ ...value, sortBy: sortBy as 'newest' | 'oldest' | 'name' | 'size' });
  };

  const handleClearDateRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ ...value, dateRange: undefined });
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      
      <div className="flex flex-wrap gap-2">
        {/* Category Filter */}
        <Select value={value.category || 'all_categories'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_categories">All Categories</SelectItem>
            <SelectItem value="contract">Contracts</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="receipt">Receipts</SelectItem>
            <SelectItem value="proposal">Proposals</SelectItem>
            <SelectItem value="permit">Permits</SelectItem>
            <SelectItem value="drawing">Drawings</SelectItem>
            <SelectItem value="photo">Photos</SelectItem>
            <SelectItem value="warranty">Warranties</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        {/* Entity Type Filter */}
        <Select value={value.entityType || 'all_entities'} onValueChange={handleEntityTypeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_entities">All Entities</SelectItem>
            <SelectItem value="PROJECT">Projects</SelectItem>
            <SelectItem value="CUSTOMER">Customers</SelectItem>
            <SelectItem value="VENDOR">Vendors</SelectItem>
            <SelectItem value="SUBCONTRACTOR">Subcontractors</SelectItem>
            <SelectItem value="EXPENSE">Expenses</SelectItem>
            <SelectItem value="ESTIMATE">Estimates</SelectItem>
            <SelectItem value="WORK_ORDER">Work Orders</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !value.dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value.dateRange?.from ? (
                value.dateRange.to ? (
                  <>
                    {format(value.dateRange.from, "MMM d, y")} -{" "}
                    {format(value.dateRange.to, "MMM d, y")}
                  </>
                ) : (
                  format(value.dateRange.from, "MMM d, y")
                )
              ) : (
                <span>Date Range</span>
              )}
              {value.dateRange && (
                <button 
                  onClick={handleClearDateRange}
                  className="ml-auto"
                  aria-label="Clear date range"
                >
                  <X className="h-4 w-4 opacity-50 hover:opacity-100" />
                </button>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value.dateRange?.from}
              selected={value.dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Sort By Filter */}
        <Select value={value.sortBy || 'newest'} onValueChange={handleSortByChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="size">Size (Largest)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DocumentFilter;
