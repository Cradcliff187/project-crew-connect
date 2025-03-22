
import { useState, useEffect } from 'react';
import { Search, Clock, Filter, Calendar, Download } from 'lucide-react';
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
import { TimeEntry } from '@/types/timeTracking';

const TimeTracking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchTimeEntries();
  }, [filterType]);
  
  const fetchTimeEntries = async () => {
    setIsLoading(true);
    
    try {
      // Query time_entries table directly, which should now have all entries
      let query = supabase
        .from('time_entries')
        .select(`
          id,
          entity_type,
          entity_id,
          date_worked,
          start_time,
          end_time,
          hours_worked,
          employee_id,
          employee_rate,
          notes,
          has_receipts,
          created_at,
          updated_at
        `)
        .order('date_worked', { ascending: false });
      
      // Apply entity type filter if selected
      if (filterType === 'work_orders') {
        query = query.eq('entity_type', 'work_order');
      } else if (filterType === 'projects') {
        query = query.eq('entity_type', 'project');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log('Fetched time entries:', data);
      
      // Enhance the data with entity names and other details
      const enhancedEntries = await Promise.all((data || []).map(async (entry: any) => {
        let entityName = 'Unknown';
        let entityLocation = '';
        let employeeName = '';
        
        // Get entity details (work order or project)
        if (entry.entity_type === 'work_order') {
          const { data: workOrder } = await supabase
            .from('maintenance_work_orders')
            .select('title, location_id')
            .eq('work_order_id', entry.entity_id)
            .maybeSingle();
          
          if (workOrder) {
            entityName = workOrder.title;
            
            if (workOrder.location_id) {
              const { data: location } = await supabase
                .from('site_locations')
                .select('location_name, city, state')
                .eq('location_id', workOrder.location_id)
                .maybeSingle();
              
              if (location) {
                entityLocation = location.location_name || 
                  [location.city, location.state].filter(Boolean).join(', ');
              }
            }
          }
        } else {
          const { data: project } = await supabase
            .from('projects')
            .select('projectname, sitelocationcity, sitelocationstate')
            .eq('projectid', entry.entity_id)
            .maybeSingle();
          
          if (project) {
            entityName = project.projectname || `Project ${entry.entity_id}`;
            entityLocation = [project.sitelocationcity, project.sitelocationstate]
              .filter(Boolean).join(', ');
          }
        }
        
        // Get employee name if there's an employee ID
        if (entry.employee_id) {
          const { data: employee } = await supabase
            .from('employees')
            .select('first_name, last_name')
            .eq('employee_id', entry.employee_id)
            .maybeSingle();
          
          if (employee) {
            employeeName = `${employee.first_name} ${employee.last_name}`;
          }
        }
        
        // Calculate cost if there's an employee rate
        const cost = entry.hours_worked && entry.employee_rate 
          ? entry.hours_worked * entry.employee_rate 
          : undefined;
        
        return {
          ...entry,
          entity_name: entityName,
          entity_location: entityLocation || undefined,
          employee_name: employeeName || undefined,
          cost
        };
      }));
      
      // Apply search filter if needed
      let filteredEntries = enhancedEntries;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredEntries = enhancedEntries.filter((entry: any) => 
          (entry.entity_name && entry.entity_name.toLowerCase().includes(query)) ||
          (entry.entity_location && entry.entity_location.toLowerCase().includes(query)) ||
          (entry.employee_name && entry.employee_name.toLowerCase().includes(query)) ||
          (entry.notes && entry.notes.toLowerCase().includes(query))
        );
      }
      
      setTimeEntries(filteredEntries);
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
    try {
      // Get the entry details before deleting
      const { data: entry, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Delete the time entry
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // If the entry was for a work order, also clean up work_order_time_logs
      // Note: This is a best effort cleanup; database triggers handle the actual cost recalculation
      if (entry.entity_type === 'work_order') {
        const { error: workOrderLogError } = await supabase
          .from('work_order_time_logs')
          .delete()
          .eq('work_order_id', entry.entity_id)
          .eq('hours_worked', entry.hours_worked)
          .eq('employee_id', entry.employee_id || '')
          .eq('work_date', entry.date_worked);
          
        if (workOrderLogError) {
          console.warn('Warning: Could not clean up associated work order time log:', workOrderLogError);
        }
      }
      
      toast({
        title: 'Time entry deleted',
        description: 'The time entry has been successfully deleted.',
      });
      
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
      if (entry.entity_type === 'work_order') {
        console.log('View work order:', entry.entity_id);
        // You could add navigation to the work order page here
      } else {
        console.log('View project:', entry.entity_id);
        // You could add navigation to the project page here
      }
    }
  };
  
  const handleViewReceipts = async (id: string) => {
    try {
      const { data: receipts, error } = await supabase
        .from('time_entry_receipts')
        .select('*')
        .eq('time_entry_id', id);
        
      if (error) throw error;
      
      if (receipts && receipts.length > 0) {
        console.log('Receipts for time entry:', receipts);
        
        // Here you would typically open a modal to display the receipts
        // For now, just show a toast with the number of receipts
        toast({
          title: 'Receipts found',
          description: `Found ${receipts.length} receipt(s) for this time entry.`,
        });
      } else {
        toast({
          title: 'No receipts',
          description: 'No receipts were found for this time entry.',
        });
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load receipts for this time entry.',
        variant: 'destructive',
      });
    }
  };
  
  const handleFormSuccess = () => {
    setActiveTab('list');
    fetchTimeEntries();
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
            
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0485ea]"></div>
                </div>
              ) : (
                <TimeTrackingTable 
                  entries={timeEntries}
                  onDelete={handleDeleteEntry}
                  onView={handleViewEntry}
                  onViewReceipts={handleViewReceipts}
                />
              )}
            </TabsContent>
            
            <TabsContent value="new" className="mt-0">
              <TimeEntryForm onSuccess={handleFormSuccess} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

export default TimeTracking;
