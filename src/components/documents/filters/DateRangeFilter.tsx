import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState<Date | null>(startDate);
  const [localEndDate, setLocalEndDate] = useState<Date | null>(endDate);

  const hasDateFilter = !!startDate || !!endDate;

  const handleApply = () => {
    onDateRangeChange(localStartDate, localEndDate);
    setPopoverOpen(false);
  };

  const handleClear = () => {
    setLocalStartDate(null);
    setLocalEndDate(null);
    onDateRangeChange(null, null);
    setPopoverOpen(false);
  };

  const formatDateDisplay = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    if (startDate) {
      return `From ${format(startDate, 'MMM d, yyyy')}`;
    }
    if (endDate) {
      return `Until ${format(endDate, 'MMM d, yyyy')}`;
    }
    return 'Select date range';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Date Filter</h3>
        {hasDateFilter && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground flex items-center"
            onClick={handleClear}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </button>
        )}
      </div>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasDateFilter ? 'default' : 'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              hasDateFilter
                ? 'bg-[#0485ea] text-white hover:bg-[#0485ea]/90'
                : 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateDisplay()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            <div className="grid gap-2">
              <h4 className="text-sm font-medium">Start Date</h4>
              <Calendar
                mode="single"
                selected={localStartDate || undefined}
                onSelect={setLocalStartDate}
                initialFocus
              />
            </div>
            <div className="grid gap-2">
              <h4 className="text-sm font-medium">End Date</h4>
              <Calendar
                mode="single"
                selected={localEndDate || undefined}
                onSelect={setLocalEndDate}
                initialFocus
                disabled={date => (localStartDate ? date < localStartDate : false)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={handleClear}>
                Clear
              </Button>
              <Button size="sm" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilter;
