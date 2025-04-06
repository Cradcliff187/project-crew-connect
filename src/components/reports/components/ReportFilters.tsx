
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRange {
  from: Date;
  to: Date;
}

interface ReportFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ 
  dateRange, 
  onDateRangeChange 
}) => {
  return (
    <Card className="p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            Date Range
          </label>
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-from"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateRange.from ? (
                    format(dateRange.from, "PPP")
                  ) : (
                    <span>Pick a start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => onDateRangeChange({ ...dateRange, from: date || new Date() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            To
          </label>
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-to"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateRange.to ? (
                    format(dateRange.to, "PPP")
                  ) : (
                    <span>Pick an end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => onDateRangeChange({ ...dateRange, to: date || new Date() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid gap-2 content-end">
          <Button 
            size="sm" 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => onDateRangeChange({
              from: new Date(new Date().getFullYear(), 0, 1),
              to: new Date()
            })}
          >
            This Year
          </Button>
        </div>

        <div className="grid gap-2 content-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDateRangeChange({
              from: new Date(new Date().getFullYear() - 1, 0, 1),
              to: new Date(new Date().getFullYear(), 11, 31)
            })}
          >
            Last Year
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ReportFilters;
