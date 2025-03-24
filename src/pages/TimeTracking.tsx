
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import { format, subDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Plus, Clock, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import TimeEntryList from '@/components/timeTracking/TimeEntryList';
import TimeEntryForm from '@/components/timeTracking/TimeEntryForm';
import { useMediaQuery } from '@/hooks/use-media-query';
import MobileTimeEntryView from '@/components/timeTracking/MobileTimeEntryView';
import { TimeEntry } from '@/types/timeTracking';

const TimeTracking = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState('entries');
  
  // Detect if we're on a mobile device
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Format for display
  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');
  
  // Function to fetch time entries
  const fetchTimeEntries = async () => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    
    // First fetch the time entries
    const { data: timeEntries, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('date_worked', dateString)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // For each time entry, fetch its receipts through the junction table
    const enhancedData = await Promise.all((timeEntries || []).map(async (entry) => {
      let entityName = "Unknown";
      let entityLocation = "";
      
      if (entry.entity_type === 'project') {
        const { data: projectData } = await supabase
          .from('projects')
          .select('projectname, sitelocationaddress, sitelocationcity, sitelocationstate')
          .eq('projectid', entry.entity_id)
          .single();
          
        if (projectData) {
          entityName = projectData.projectname;
          entityLocation = [
            projectData.sitelocationaddress,
            projectData.sitelocationcity,
            projectData.sitelocationstate
          ].filter(Boolean).join(', ');
        }
      } else if (entry.entity_type === 'work_order') {
        const { data: workOrderData } = await supabase
          .from('maintenance_work_orders')
          .select('title, description')
          .eq('work_order_id', entry.entity_id)
          .single();
          
        if (workOrderData) {
          entityName = workOrderData.title;
        }
      }
      
      // Fetch employee name if available
      let employeeName = "Unassigned";
      if (entry.employee_id) {
        const { data: employeeData } = await supabase
          .from('employees')
          .select('first_name, last_name')
          .eq('employee_id', entry.employee_id)
          .single();
          
        if (employeeData) {
          employeeName = `${employeeData.first_name} ${employeeData.last_name}`;
        }
      }
      
      // Fetch the receipt documents through the junction table
      let documents = [];
      if (entry.has_receipts) {
        const { data: documentLinks } = await supabase
          .from('time_entry_document_links')
          .select('document_id')
          .eq('time_entry_id', entry.id);
          
        if (documentLinks && documentLinks.length > 0) {
          const documentIds = documentLinks.map(link => link.document_id);
          const { data: docs } = await supabase
            .from('documents')
            .select('*')
            .in('document_id', documentIds);
            
          documents = docs || [];
        }
      }
      
      return {
        ...entry,
        entity_name: entityName,
        entity_location: entityLocation,
        employee_name: employeeName,
        documents: documents
      };
    }));
    
    return enhancedData as TimeEntry[];
  };
  
  const { data: timeEntries, isLoading, refetch } = useQuery({
    queryKey: ['timeEntries', selectedDate.toISOString()],
    queryFn: fetchTimeEntries,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching time entries:', error);
      }
    }
  });
  
  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };
  
  const handleNextDay = () => {
    setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setShowCalendar(false);
    }
  };
  
  const handleAddSuccess = () => {
    setShowAddForm(false);
    refetch();
  };
  
  // Calculate total hours for the selected day
  const totalHours = timeEntries?.reduce((sum, entry) => sum + entry.hours_worked, 0) || 0;
  
  // If on mobile, show a simplified view
  if (isMobile) {
    return (
      <MobileTimeEntryView 
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        timeEntries={timeEntries || []}
        isLoading={isLoading}
        onAddSuccess={handleAddSuccess}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        totalHours={totalHours}
      />
    );
  }
  
  return (
    <PageTransition>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#0485ea]">Time Tracking</h1>
          <Button 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Time
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader className="pb-3">
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
                      timeEntries={timeEntries || []} 
                      isLoading={isLoading}
                      onEntryChange={refetch}
                    />
                  </TabsContent>
                  <TabsContent value="add" className="mt-4">
                    <TimeEntryForm onSuccess={handleAddSuccess} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="hidden lg:block">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Add Time Entry</CardTitle>
                <CardDescription>
                  Log your time for work orders or projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimeEntryForm onSuccess={handleAddSuccess} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Mobile Add Form Dialog */}
      {isMobile && showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Log Time</h2>
            </div>
            <div className="p-4">
              <TimeEntryForm onSuccess={handleAddSuccess} />
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default TimeTracking;
