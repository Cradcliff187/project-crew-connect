
import React from 'react';
import { Search, Filter, Check, X, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, formatDate } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DocumentCategory, EntityType, entityTypes } from './schemas/documentSchema';
import DocumentCategorySelector from './DocumentCategorySelector';

interface FilterOptions {
  search: string;
  category?: DocumentCategory;
  entityType?: EntityType;
  isExpense?: boolean;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  sortBy?: string;
}

interface DocumentFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
  activeFiltersCount: number;
}

const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  activeFiltersCount
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [tempFilters, setTempFilters] = React.useState<FilterOptions>(filters);

  // Reset temp filters when dialog opens
  React.useEffect(() => {
    if (isDialogOpen) {
      setTempFilters(filters);
    }
  }, [isDialogOpen, filters]);

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
    setIsDialogOpen(false);
  };

  const handleTempFilterChange = (key: keyof FilterOptions, value: any) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRemoveFilter = (filterKey: keyof FilterOptions) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'category') {
      newFilters.category = undefined;
    } else if (filterKey === 'entityType') {
      newFilters.entityType = undefined;
    } else if (filterKey === 'dateRange') {
      newFilters.dateRange = undefined;
    } else if (filterKey === 'isExpense') {
      newFilters.isExpense = undefined;
    }
    
    onFilterChange(newFilters);
  };

  // Format date range for display
  const dateRangeText = filters.dateRange?.from && filters.dateRange?.to 
    ? `${formatDate(filters.dateRange.from)} - ${formatDate(filters.dateRange.to)}`
    : filters.dateRange?.from 
      ? `From ${formatDate(filters.dateRange.from)}`
      : filters.dateRange?.to 
        ? `Until ${formatDate(filters.dateRange.to)}`
        : undefined;

  // Group entity types for better organization
  const groupedEntityTypes = {
    business: ['PROJECT', 'WORK_ORDER', 'ESTIMATE'],
    people: ['CUSTOMER', 'VENDOR', 'SUBCONTRACTOR'],
    financial: ['EXPENSE']
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />
        </div>
        
        {/* Sort and Filter Buttons */}
        <div className="flex items-center gap-2">
          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={(value) => onFilterChange({ ...filters, sortBy: value })}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4 text-[#0485ea]" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Filter Documents</DialogTitle>
                <DialogDescription>
                  Apply filters to narrow down your document list
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Document Category */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Document Type</h4>
                  <DocumentCategorySelector
                    value={tempFilters.category || 'other'}
                    onChange={(category) => handleTempFilterChange('category', category)}
                  />
                </div>
                
                {/* Entity Type */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Related To</h4>
                  <Select
                    value={tempFilters.entityType || 'all'}
                    onValueChange={(value) => 
                      handleTempFilterChange('entityType', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All entities</SelectItem>
                      
                      {/* Business entities */}
                      <SelectItem value="PROJECT">Projects</SelectItem>
                      <SelectItem value="WORK_ORDER">Work Orders</SelectItem>
                      <SelectItem value="ESTIMATE">Estimates</SelectItem>
                      
                      {/* People entities */}
                      <SelectItem value="CUSTOMER">Customers</SelectItem>
                      <SelectItem value="VENDOR">Vendors</SelectItem>
                      <SelectItem value="SUBCONTRACTOR">Subcontractors</SelectItem>
                      
                      {/* Financial entities */}
                      <SelectItem value="EXPENSE">Expenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Expense Only Toggle */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="expense-only"
                    checked={tempFilters.isExpense === true}
                    onCheckedChange={(checked) => {
                      handleTempFilterChange('isExpense', checked ? true : undefined);
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="expense-only"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show Expenses Only
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Only show documents marked as expenses
                    </p>
                  </div>
                </div>
                
                {/* Date Range */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Date Range</h4>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {tempFilters.dateRange?.from || tempFilters.dateRange?.to ? (
                          <span>
                            {tempFilters.dateRange.from && formatDate(tempFilters.dateRange.from)}
                            {tempFilters.dateRange.from && tempFilters.dateRange.to && " - "}
                            {tempFilters.dateRange.to && formatDate(tempFilters.dateRange.to)}
                          </span>
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        selected={{
                          from: tempFilters.dateRange?.from || undefined,
                          to: tempFilters.dateRange?.to || undefined
                        }}
                        onSelect={(range) => {
                          if (!range) {
                            handleTempFilterChange('dateRange', undefined);
                          } else {
                            handleTempFilterChange('dateRange', range);
                          }
                        }}
                        numberOfMonths={1}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  setTempFilters({
                    ...filters,
                    category: undefined,
                    entityType: undefined,
                    isExpense: undefined,
                    dateRange: undefined
                  });
                }}>
                  Reset Filters
                </Button>
                <Button 
                  onClick={handleApplyFilters}
                  className="bg-[#0485ea] hover:bg-[#0375d1]"
                >
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.category && (
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 bg-gray-50 px-2 py-1"
            >
              <span>Type: {filters.category}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => handleRemoveFilter('category')}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          )}
          
          {filters.entityType && (
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 bg-gray-50 px-2 py-1"
            >
              <span>Related to: {filters.entityType.replace('_', ' ').toLowerCase()}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => handleRemoveFilter('entityType')}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          )}
          
          {filters.isExpense && (
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 bg-gray-50 px-2 py-1"
            >
              <span>Expenses only</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => handleRemoveFilter('isExpense')}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          )}
          
          {dateRangeText && (
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 bg-gray-50 px-2 py-1"
            >
              <span>Date: {dateRangeText}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => handleRemoveFilter('dateRange')}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          )}
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={onReset}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentFilters;
