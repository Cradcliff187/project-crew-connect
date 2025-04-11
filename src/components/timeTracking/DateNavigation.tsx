
import React from 'react';
import { format, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from './hooks/useTimeEntries';

interface DateNavigationProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  onNextWeek: () => void;
  onPrevWeek: () => void;
  onCurrentWeek: () => void;
  totalHours: number;
  isMobile?: boolean;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  dateRange,
  onDateRangeChange,
  onNextWeek,
  onPrevWeek,
  onCurrentWeek,
  totalHours,
  isMobile = false
}) => {
  const { startDate, endDate } = dateRange;
  const today = new Date();
  
  // Check if current date range contains today
  const isCurrentWeek = isWithinInterval(today, { start: startDate, end: endDate });
  
  const formatDateRange = () => {
    if (isMobile) {
      // Shorter format for mobile
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
    }
    
    // Full format for desktop
    if (format(startDate, 'MMM yyyy') === format(endDate, 'MMM yyyy')) {
      // Same month and year
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
    } else if (format(startDate, 'yyyy') === format(endDate, 'yyyy')) {
      // Same year, different month
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    } else {
      // Different year
      return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
  };
  
  // When a date is selected in the calendar, set the week containing that date
  const handleDateSelect = (date: Date) => {
    if (!date) return;
    
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
    
    onDateRangeChange({
      startDate: weekStart,
      endDate: weekEnd
    });
  };
  
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevWeek}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous week</span>
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={isCurrentWeek ? "default" : "outline"}
                className={`mx-1 px-3 h-8 ${isCurrentWeek ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="p-0 w-auto">
              <CalendarComponent
                mode="single"
                selected={new Date(startDate)}
                onSelect={(date) => date && handleDateSelect(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onNextWeek}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next week</span>
          </Button>
        </div>
        
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCurrentWeek}
            className={isCurrentWeek ? 'invisible' : ''}
          >
            This Week
          </Button>
        )}
      </div>
      
      <div className={`flex items-center ${isMobile ? 'justify-between' : 'justify-start'}`}>
        <div className="text-sm font-medium">
          {isCurrentWeek ? 'Current Week' : `Week of ${format(startDate, 'MMMM d')}`}
        </div>
        
        <div className="flex items-center ml-3">
          <span className="text-sm font-semibold">
            {totalHours.toFixed(2)} hours logged
          </span>
        </div>
      </div>
    </div>
  );
};

export default DateNavigation;
