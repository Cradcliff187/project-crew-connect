import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock } from 'lucide-react';
import { TimeEntry } from '@/types/timeTracking';
import { Employee } from '@/types/common';
import { useEmployees } from '@/hooks/useEmployees';

import { TimeEntryList } from './TimeEntryList';
import TimeEntryFormWizard from './TimeEntryFormWizard';
import DateNavigation from '@/components/timeTracking/DateNavigation';
import { DateRange } from './hooks/useTimeEntries';
import TimeTrackingTable from '@/components/timeTracking/TimeTrackingTable';

interface DesktopTimeEntryViewProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  onNextWeek: () => void;
  onPrevWeek: () => void;
  onCurrentWeek: () => void;
  timeEntries: TimeEntry[];
  employees: Employee[];
  isLoading: boolean;
  onAddSuccess: () => void;
  totalHours: number;
  onEditEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (entry: TimeEntry) => void;
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
  onOpenAddSheet: () => void;
  onOpenEditSheet: (entry: TimeEntry) => void;
}

const DesktopTimeEntryView: React.FC<DesktopTimeEntryViewProps> = ({
  dateRange,
  onDateRangeChange,
  onNextWeek,
  onPrevWeek,
  onCurrentWeek,
  timeEntries,
  employees,
  isLoading,
  onAddSuccess,
  totalHours,
  onEditEntry,
  onDeleteEntry,
  onOpenAddSheet,
  onOpenEditSheet,
}: DesktopTimeEntryViewProps) => {
  const [activeTab, setActiveTab] = useState('entries');

  // Adapter function for onDelete prop
  const handleDeleteById = (id: string) => {
    const entryToDelete = timeEntries.find(entry => entry.id === id);
    if (entryToDelete) {
      onDeleteEntry(entryToDelete); // Call the parent's onDelete with the entry
    } else {
      console.error('Could not find time entry to delete with ID:', id);
    }
  };

  useEffect(() => {
    // No specific action needed here, just ensuring the component re-renders
    // when date range changes since we're now passing timeEntries as props
  }, [dateRange, timeEntries]);

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0485ea]">Time Tracking</h1>
        <Button className="bg-[#0485ea] hover:bg-[#0375d1]" onClick={() => setActiveTab('add')}>
          <Plus className="h-4 w-4 mr-2" />
          Log Time
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <DateNavigation
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
              onNextWeek={onNextWeek}
              onPrevWeek={onPrevWeek}
              onCurrentWeek={onCurrentWeek}
              totalHours={totalHours}
            />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="entries" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="entries">Time Entries</TabsTrigger>
                <TabsTrigger value="add">Add Entry</TabsTrigger>
              </TabsList>
              <TabsContent value="entries" className="mt-4 flex-1 overflow-auto">
                <TimeTrackingTable
                  entries={timeEntries}
                  onDelete={handleDeleteById}
                  onEdit={onOpenEditSheet}
                  onView={() => {}}
                  onViewReceipts={() => {}}
                />
              </TabsContent>
              <TabsContent value="add" className="mt-4">
                <TimeEntryFormWizard
                  onSuccess={() => {
                    onAddSuccess();
                    setActiveTab('entries');
                  }}
                  date={new Date()}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesktopTimeEntryView;
