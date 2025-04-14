import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock } from 'lucide-react';
import { TimeEntry } from '@/types/timeTracking';

import { TimeEntryList } from './TimeEntryList';
import TimeEntryFormWizard from './TimeEntryFormWizard';
import DateNavigation from './DateNavigation';
import { DateRange } from './hooks/useTimeEntries';

interface DesktopTimeEntryViewProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  onNextWeek: () => void;
  onPrevWeek: () => void;
  onCurrentWeek: () => void;
  timeEntries: TimeEntry[];
  isLoading: boolean;
  onAddSuccess: () => void;
  totalHours: number;
}

const DesktopTimeEntryView: React.FC<DesktopTimeEntryViewProps> = ({
  dateRange,
  onDateRangeChange,
  onNextWeek,
  onPrevWeek,
  onCurrentWeek,
  timeEntries,
  isLoading,
  onAddSuccess,
  totalHours,
}) => {
  const [activeTab, setActiveTab] = useState('entries');

  // Effect to trigger data loading when component mounts or dateRange changes
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
              <TabsContent value="entries" className="mt-4">
                <TimeEntryList
                  entries={timeEntries}
                  isLoading={isLoading}
                  onEntryChange={onAddSuccess}
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
