
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { ReportFilters } from '@/types/reports';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  
  return (
    <div className="mb-4 p-3 border rounded-md bg-muted/50">
      <h3 className="text-sm font-semibold mb-2">Filter Options</h3>
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
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {getStatusOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
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
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {getRoleOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
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
