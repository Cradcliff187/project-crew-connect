
import { Clock, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TimeTrackingTable from '../TimeTrackingTable';
import TimeEntryForm from '../TimeEntryForm';
import { TimeEntry } from '@/types/timeTracking';

interface TimeTrackingTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  filteredEntries: TimeEntry[];
  onViewEntry: (id: string) => void;
  onEditEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onViewReceipts: (id: string) => Promise<void>;
  onSuccess: () => void;
}

const TimeTrackingTabs = ({
  activeTab,
  setActiveTab,
  isLoading,
  filteredEntries,
  onViewEntry,
  onEditEntry,
  onDeleteEntry,
  onViewReceipts,
  onSuccess
}: TimeTrackingTabsProps) => {
  return (
    <Tabs defaultValue="list" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Time Entries
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Log New Time
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="list" className="mt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0485ea]"></div>
          </div>
        ) : (
          <TimeTrackingTable 
            entries={filteredEntries}
            onDelete={onDeleteEntry}
            onView={onViewEntry}
            onEdit={onEditEntry}
            onViewReceipts={onViewReceipts}
          />
        )}
      </TabsContent>
      
      <TabsContent value="new" className="mt-0">
        <TimeEntryForm onSuccess={onSuccess} />
      </TabsContent>
    </Tabs>
  );
};

export default TimeTrackingTabs;
