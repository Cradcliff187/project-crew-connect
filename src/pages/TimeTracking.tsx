
import { useState, useEffect } from 'react';
import { Search, Clock, Filter, Calendar, Download, Eye, FileText } from 'lucide-react';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';

const TimeTracking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReceiptsDialog, setShowReceiptsDialog] = useState(false);
  const [currentReceipts, setCurrentReceipts] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  
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
          employee_name,
          employee_rate,
          notes,
          has_receipts,
          receipt_amount,
          vendor_id,
          vendor_name,
          total_cost,
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
        
        // Calculate cost if there's an employee rate
        const cost = entry.hours_worked && entry.employee_rate 
          ? entry.hours_worked * entry.employee_rate 
          : entry.hours_worked * 75; // Default rate if none specified
        
        return {
          ...entry,
          entity_name: entityName,
          entity_location: entityLocation || undefined,
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
          (entry.vendor_name && entry.vendor_name.toLowerCase().includes(query)) ||
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
      
      // Delete any associated receipt records
      const { error: receiptDeleteError } = await supabase
        .from('time_entry_receipts')
        .delete()
        .eq('time_entry_id', id);
        
      if (receiptDeleteError) {
        console.warn('Warning: Could not delete associated receipts:', receiptDeleteError);
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
      setSelectedEntryId(id);
      
      const { data: receipts, error } = await supabase
        .from('time_entry_receipts')
        .select('*')
        .eq('time_entry_id', id);
        
      if (error) throw error;
      
      if (receipts && receipts.length > 0) {
        console.log('Receipts for time entry:', receipts);
        
        // Get public URLs for the receipts
        const receiptsWithUrls = await Promise.all(receipts.map(async (receipt) => {
          const { data, error } = await supabase.storage
            .from('construction_documents')
            .createSignedUrl(receipt.storage_path, 3600); // 1 hour expiration
            
          return {
            ...receipt,
            url: error ? null : data?.signedUrl
          };
        }));
        
        setCurrentReceipts(receiptsWithUrls);
        setShowReceiptsDialog(true);
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

  // Get the entry that has receipts being viewed
  const entryWithReceipts = timeEntries.find(entry => entry.id === selectedEntryId);
  
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

        {/* Receipts Dialog */}
        <Dialog open={showReceiptsDialog} onOpenChange={setShowReceiptsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Receipt Details</DialogTitle>
              <DialogDescription>
                {entryWithReceipts ? (
                  <>
                    {entryWithReceipts.entity_name} - {formatDate(entryWithReceipts.date_worked)}
                    {entryWithReceipts.vendor_name && (
                      <span className="ml-2 text-[#0485ea]">
                        Vendor: {entryWithReceipts.vendor_name}
                      </span>
                    )}
                  </>
                ) : "Viewing uploaded receipts"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {currentReceipts.map((receipt, index) => (
                <div key={index} className="border rounded-md p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm truncate">{receipt.file_name}</h3>
                    {receipt.amount && (
                      <span className="text-sm font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        ${receipt.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {receipt.url ? (
                    receipt.file_type?.startsWith('image/') ? (
                      <div className="h-48 flex items-center justify-center border rounded-md overflow-hidden">
                        <img 
                          src={receipt.url} 
                          alt={receipt.file_name} 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center border rounded-md bg-gray-50">
                        <div className="text-center space-y-2">
                          <FileText className="h-12 w-12 mx-auto text-gray-400" />
                          <div className="text-sm text-gray-500">PDF Document</div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(receipt.url, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Document
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="h-48 flex items-center justify-center border rounded-md bg-gray-50">
                      <div className="text-sm text-gray-500">Unable to load preview</div>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {(receipt.file_size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span>
                      {new Date(receipt.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default TimeTracking;
