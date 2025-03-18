
import { useState, useEffect } from 'react';
import { Search, Clock, Filter, ChevronDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import PageTransition from '@/components/layout/PageTransition';
import PageHeader from '@/components/layout/PageHeader';
import TimeEntryForm from '@/components/timeTracking/TimeEntryForm';
import TimeTrackingTable from '@/components/timeTracking/TimeTrackingTable';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';

const TimeTracking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchTimeEntries();
  }, [filterType]);
  
  const fetchTimeEntries = async () => {
    setIsLoading(true);
    
    try {
      // Fetch work order time logs
      const { data: workOrderLogs, error: woError } = await supabase
        .from('work_order_time_logs')
        .select(`
          id,
          work_order_id,
          employee_id,
          hours_worked,
          work_date,
          notes,
          maintenance_work_orders(title, status)
        `)
        .order('work_date', { ascending: false });
      
      if (woError) throw woError;
      
      // Fetch project time logs (timelogs)
      const { data: projectLogs, error: projError } = await supabase
        .from('timelogs')
        .select(`
          timelogid,
          projectid,
          dateworked,
          starttime,
          endtime,
          totalhours,
          submittinguser,
          foruseremail,
          "employee hourly rate",
          projects(projectname, status, sitelocationcity, sitelocationstate)
        `)
        .order('dateworked', { ascending: false });
      
      if (projError) throw projError;
      
      // Format work order logs
      const formattedWorkOrderLogs = (workOrderLogs || []).map(log => ({
        id: log.id,
        entityType: 'work_order',
        entityId: log.work_order_id,
        entityName: log.maintenance_work_orders?.title || 'Unknown Work Order',
        dateWorked: log.work_date,
        startTime: '09:00', // Default since we don't have this in the table
        endTime: '17:00', // Default since we don't have this in the table
        hoursWorked: log.hours_worked,
        notes: log.notes,
        hasReceipts: false, // We would need to check documents table
        employee: {
          id: log.employee_id,
          name: 'Employee Name', // We would need to join with employees table
        }
      }));
      
      // Format project logs
      const formattedProjectLogs = (projectLogs || []).map(log => ({
        id: log.timelogid,
        entityType: 'project',
        entityId: log.projectid,
        entityName: log.projects?.projectname || 'Unknown Project',
        entityLocation: [log.projects?.sitelocationcity, log.projects?.sitelocationstate].filter(Boolean).join(', '),
        dateWorked: log.dateworked,
        startTime: log.starttime || '09:00',
        endTime: log.endtime || '17:00',
        hoursWorked: parseFloat(log.totalhours) || 0,
        employee: {
          id: log.submittinguser,
          name: log.foruseremail?.split('@')[0] || 'Unknown',
          hourlyRate: log["employee hourly rate"] ? parseFloat(log["employee hourly rate"]) : undefined,
        },
        cost: log["employee hourly rate"] && log.totalhours ? 
          parseFloat(log["employee hourly rate"]) * parseFloat(log.totalhours) : undefined,
      }));
      
      // Combined and filter entries
      let combinedEntries = [...formattedWorkOrderLogs, ...formattedProjectLogs];
      
      if (filterType === 'work_orders') {
        combinedEntries = formattedWorkOrderLogs;
      } else if (filterType === 'projects') {
        combinedEntries = formattedProjectLogs;
      }
      
      // Apply search filter if any
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        combinedEntries = combinedEntries.filter(entry => 
          entry.entityName.toLowerCase().includes(query) ||
          (entry.employee?.name && entry.employee.name.toLowerCase().includes(query)) ||
          (entry.notes && entry.notes.toLowerCase().includes(query))
        );
      }
      
      setTimeEntries(combinedEntries);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time entries.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteEntry = async (id: string) => {
    // Find the entry to determine its type
    const entry = timeEntries.find(e => e.id === id);
    
    if (!entry) return;
    
    try {
      if (entry.entityType === 'work_order') {
        const { error } = await supabase
          .from('work_order_time_logs')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('timelogs')
          .delete()
          .eq('timelogid', id);
          
        if (error) throw error;
      }
      
      toast({
        title: 'Time entry deleted',
        description: 'The time entry has been successfully deleted.',
      });
      
      // Refresh the time entries
      fetchTimeEntries();
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time entry.',
        variant: 'destructive',
      });
    }
  };
  
  const handleViewEntry = (id: string) => {
    const entry = timeEntries.find(e => e.id === id);
    if (entry) {
      if (entry.entityType === 'work_order') {
        // Navigate to work order details
        console.log('View work order:', entry.entityId);
      } else {
        // Navigate to project details
        console.log('View project:', entry.entityId);
      }
    }
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <PageHeader
          title="Time Tracking"
          description="Log and manage time for projects and work orders"
        >
          <div className="relative w-full md:w-auto flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search entries..." 
              className="pl-9 subtle-input rounded-md"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === '') {
                  // Refresh entries when search is cleared
                  fetchTimeEntries();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  fetchTimeEntries();
                }
              }}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select 
              value={filterType} 
              onValueChange={setFilterType}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="work_orders">Work Orders Only</SelectItem>
                <SelectItem value="projects">Projects Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PageHeader>
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
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
              <TimeTrackingTable 
                entries={timeEntries}
                onDelete={handleDeleteEntry}
                onView={handleViewEntry}
              />
            </TabsContent>
            
            <TabsContent value="new" className="mt-0">
              <TimeEntryForm />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

export default TimeTracking;
