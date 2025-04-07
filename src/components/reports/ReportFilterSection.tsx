
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { ReportFilters } from '@/types/reports';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ReportFilterSectionProps {
  filters: ReportFilters;
  onFilterChange: (key: keyof ReportFilters, value: any) => void;
  getStatusOptions: () => { value: string, label: string }[];
  getRoleOptions?: () => { value: string, label: string }[];
  showEmployeeFilters?: boolean;
}

const ReportFilterSection = ({
  filters,
  onFilterChange,
  getStatusOptions,
  getRoleOptions = () => [],
  showEmployeeFilters = false
}: ReportFilterSectionProps) => {
  // Create a valid DateRange object to pass to the DatePickerWithRange
  const dateRange = {
    from: filters.dateRange?.from || undefined,
    to: filters.dateRange?.to || undefined
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    onFilterChange('search', '');
    onFilterChange('dateRange', undefined);
    onFilterChange('status', 'all');
    if (showEmployeeFilters) {
      onFilterChange('role', 'all');
    }
  };
  
  return (
    <div className="mb-4 p-3 border rounded-md bg-white shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-[#0485ea]">Filter Options</h3>
        <Button 
          variant="ghost" 
          size="xs"
          className="h-6 text-xs"
          onClick={clearAllFilters}
        >
          <X className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Date Range Filter */}
        <div>
          <label className="text-xs font-medium mb-1 block">Date Range</label>
          <DatePickerWithRange 
            value={dateRange}
            onChange={(range) => onFilterChange('dateRange', range)}
          />
        </div>
        
        {/* Status Filter */}
        <div>
          <label className="text-xs font-medium mb-1 block">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFilterChange('status', value)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {getStatusOptions().map(option => (
                <SelectItem key={option.value} value={option.value} className="text-xs">{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Entity-specific filters */}
        {showEmployeeFilters && (
          <div>
            <label className="text-xs font-medium mb-1 block">Role</label>
            <Select
              value={filters.role || 'all'}
              onValueChange={(value) => onFilterChange('role', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {getRoleOptions().map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportFilterSection;
