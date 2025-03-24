
import React, { useState } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { TimeEntry } from '@/types/timeTracking';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import TimeEntryList from './TimeEntryList';
import TimeEntryForm from './TimeEntryForm';
import PageTransition from '@/components/layout/PageTransition';

interface MobileTimeEntryViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  timeEntries: TimeEntry[];
  isLoading: boolean;
  onAddSuccess: () => void;
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  totalHours: number;
}

const MobileTimeEntryView: React.FC<MobileTimeEntryViewProps> = ({
  selectedDate,
  setSelectedDate,
  timeEntries,
  isLoading,
  onAddSuccess,
  showAddForm,
  setShowAddForm,
  totalHours
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  
  const formattedDate = format(selectedDate, 'EEE, MMM d');
  
  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };
  
  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowCalendar(false);
    }
  };
  
  return (
    <PageTransition>
      <div className="container px-4 py-4">
        {/* Date Selection Header */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 font-medium text-md"
            onClick={() => setShowCalendar(true)}
          >
            <CalendarIcon className="h-4 w-4 text-[#0485ea]" />
            {formattedDate}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={handleNextDay}>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Hours summary */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-[#0485ea]" />
            <span className="font-semibold">Total Hours: {totalHours.toFixed(1)}</span>
          </div>
          <Button 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Log Time
          </Button>
        </div>
        
        {/* Time entries list */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeEntryList 
              timeEntries={timeEntries} 
              isLoading={isLoading}
              onEntryChange={onAddSuccess}
              isMobile={true}
            />
          </CardContent>
        </Card>
        
        {/* Calendar Sheet */}
        <Sheet open={showCalendar} onOpenChange={setShowCalendar}>
          <SheetContent side="bottom" className="h-[400px]">
            <SheetHeader>
              <SheetTitle>Select Date</SheetTitle>
            </SheetHeader>
            <div className="py-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                className="rounded-md border"
              />
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Log Time Sheet */}
        <Sheet open={showAddForm} onOpenChange={setShowAddForm}>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Log Time</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <TimeEntryForm onSuccess={onAddSuccess} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </PageTransition>
  );
};

export default MobileTimeEntryView;
