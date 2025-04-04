
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock } from 'lucide-react';
import { TimeEntry } from '@/types/timeTracking';

import { TimeEntryList } from './TimeEntryList';
import TimeEntryFormWizard from './TimeEntryFormWizard';
import DateNavigation from './DateNavigation';

interface DesktopTimeEntryViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  timeEntries: TimeEntry[];
  isLoading: boolean;
  onAddSuccess: () => void;
  totalHours: number;
}

const DesktopTimeEntryView: React.FC<DesktopTimeEntryViewProps> = ({
  selectedDate,
  setSelectedDate,
  timeEntries,
  isLoading,
  onAddSuccess,
  totalHours
}) => {
  const [activeTab, setActiveTab] = useState('entries');

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0485ea]">Time Tracking</h1>
        <Button 
          className="bg-[#0485ea] hover:bg-[#0375d1]"
          onClick={() => setActiveTab('add')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Log Time
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <DateNavigation 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate}
              totalHours={totalHours}
            />
            <CardDescription>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Total Hours: <span className="font-medium text-[#0485ea]">{totalHours.toFixed(1)}</span>
                </span>
              </div>
            </CardDescription>
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
                  date={selectedDate}
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
