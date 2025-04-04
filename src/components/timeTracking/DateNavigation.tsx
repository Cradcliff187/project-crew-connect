
import React from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  totalHours: number;
  isMobile?: boolean;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  onDateChange,
  totalHours,
  isMobile = false
}) => {
  const isToday = isSameDay(selectedDate, new Date());
  
  return (
    <div className="flex flex-col space-y-2 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange(subDays(selectedDate, 1))}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous day</span>
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={isToday ? "default" : "outline"}
                className={`mx-1 px-3 h-8 ${isToday ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {format(selectedDate, isMobile ? 'MMM d' : 'MMMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="center" className="p-0 w-auto">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange(addDays(selectedDate, 1))}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next day</span>
          </Button>
        </div>
        
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDateChange(new Date())}
            className={isToday ? 'invisible' : ''}
          >
            Today
          </Button>
        )}
      </div>
      
      <div className={`flex items-center ${isMobile ? 'justify-between' : 'justify-start'}`}>
        <div className="text-sm font-medium">
          {isToday ? 'Today' : format(selectedDate, 'EEEE')}
        </div>
        
        <div className="flex items-center">
          <span className="text-sm font-semibold ml-3">
            {totalHours.toFixed(2)} hours logged
          </span>
        </div>
      </div>
    </div>
  );
};

export default DateNavigation;
