
import React, { useState } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Format for display
  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
  
  const handlePreviousDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };
  
  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      setShowCalendar(false);
    }
  };
  
  if (isMobile) {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
            <ChevronUp className="h-5 w-5 rotate-90" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 font-medium text-md"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <CalendarDays className="h-4 w-4 text-[#0485ea]" />
            {format(selectedDate, 'EEE, MMM d')}
            {showCalendar ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleNextDay}>
            <ChevronUp className="h-5 w-5 -rotate-90" />
          </Button>
        </div>
        
        {showCalendar && (
          <div className="mt-2 border rounded-md p-2 bg-background">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              className="rounded-md"
            />
          </div>
        )}
        
        <div className="flex items-center mt-2">
          <Clock className="h-4 w-4 mr-2 text-[#0485ea]" />
          <span className="font-semibold">Total Hours: {totalHours.toFixed(1)}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <Collapsible open={showCalendar} onOpenChange={setShowCalendar}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-0 font-normal flex items-center text-left">
              <CalendarDays className="h-4 w-4 mr-2 text-[#0485ea]" />
              <CardTitle className="text-xl">{formattedDate}</CardTitle>
              {showCalendar ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              className="rounded-md border"
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={handlePreviousDay}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={handleNextDay}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default DateNavigation;
