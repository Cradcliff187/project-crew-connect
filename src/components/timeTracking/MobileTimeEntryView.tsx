
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeEntry } from '@/types/timeTracking';
import { Plus } from 'lucide-react';
import TimeEntryList from './TimeEntryList';
import TimeEntryForm from './TimeEntryForm';
import PageTransition from '@/components/layout/PageTransition';
import DateNavigation from './DateNavigation';

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
  return (
    <PageTransition>
      <div className="container px-4 py-4">
        {/* Date Selection Header */}
        <DateNavigation
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          totalHours={totalHours}
          isMobile={true}
        />
        
        {/* Log Time Button */}
        <div className="flex justify-end mb-4">
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
