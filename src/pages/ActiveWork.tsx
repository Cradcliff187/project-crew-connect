
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import PageHeader from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, ChevronDown, List, LayoutGrid, CalendarClock, Clock, Briefcase, Wrench } from 'lucide-react';
import ActiveWorkTable from '@/components/activeWork/ActiveWorkTable';
import ActiveWorkDashboard from '@/components/activeWork/ActiveWorkDashboard';
import { WorkItem, projectToWorkItem, workOrderToWorkItem } from '@/types/activeWork';
import { WorkOrder } from '@/types/workOrder';

const ActiveWork = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'dashboard'>('table');
  const [activeTab, setActiveTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'projects' | 'workOrders'>('all');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Fetch projects
  const { 
    data: projects = [], 
    isLoading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('projectid, projectname, customername, customerid, status, createdon')
        .order('createdon', { ascending: false });
      
      if (error) throw error;
      
      return data.map(project => ({
        ...project,
        budget: Math.floor(Math.random() * 200000) + 50000,
        spent: Math.floor(Math.random() * 150000),
        progress: Math.floor(Math.random() * 100)
      }));
    },
    meta: {
      onError: (error: any) => {
        console.error('Error fetching projects:', error);
      }
    }
  });

  // Fetch work orders
  const { 
    data: workOrders = [], 
    isLoading: workOrdersLoading, 
    error: workOrdersError,
    refetch: refetchWorkOrders
  } = useQuery({
    queryKey: ['workOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_work_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const typedWorkOrders = data?.map(order => ({
        ...order,
        status: order.status as any,
        progress: order.progress || 0,
        time_estimate: order.time_estimate || null
      })) || [];
      
      return typedWorkOrders;
    },
    meta: {
      onError: (error: any) => {
        console.error('Error fetching work orders:', error);
        toast({
          title: 'Error fetching work orders',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  });

  useEffect(() => {
    if (projectsError) {
      toast({
        title: 'Error fetching projects',
        description: (projectsError as Error).message,
        variant: 'destructive'
      });
    }
  }, [projectsError]);

  // Convert projects and work orders to unified WorkItem format
  const projectItems: WorkItem[] = projects.map(projectToWorkItem);
  const workOrderItems: WorkItem[] = workOrders.map(workOrderToWorkItem);

  // Combine and filter items based on current tab
  const getFilteredItems = () => {
    let items: WorkItem[] = [];
    
    if (activeTab === 'all' || activeTab === 'projects') {
      items = [...items, ...projectItems];
    }
    
    if (activeTab === 'all' || activeTab === 'workOrders') {
      items = [...items, ...workOrderItems];
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const customerMatch = item.customerName?.toLowerCase().includes(query) || false;
        const idMatch = item.id.toLowerCase().includes(query);
        const poMatch = item.type === 'workOrder' && item.poNumber?.toLowerCase().includes(query);
        
        return titleMatch || customerMatch || idMatch || (poMatch || false);
      });
    }
    
    return items;
  };

  const filteredItems = getFilteredItems();
  
  const handleWorkOrderChange = () => {
    refetchWorkOrders();
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <PageHeader
          title="Active Work"
          description="View and manage all active projects and work orders"
        >
          <div className="relative w-full md:w-auto flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search by name, client, ID or PO#..." 
              className="pl-9 subtle-input rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4 mr-1" />
              Filter
              <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
            </Button>
            
            <div className="border rounded-md flex">
              <Button 
                variant={viewMode === 'table' ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode('table')}
                className={viewMode === 'table' ? "bg-[#0485ea] hover:bg-[#0375d1]" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'dashboard' ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode('dashboard')}
                className={viewMode === 'dashboard' ? "bg-[#0485ea] hover:bg-[#0375d1]" : ""}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </PageHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="all">All Work</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="workOrders">Work Orders</TabsTrigger>
          </TabsList>
          
          {viewMode === 'table' ? (
            <TabsContent value={activeTab} className="space-y-6">
              <ActiveWorkTable 
                items={filteredItems}
                loading={projectsLoading || workOrdersLoading}
                projectsError={projectsError ? (projectsError as Error).message : null}
                workOrdersError={workOrdersError ? (workOrdersError as Error).message : null}
                onWorkOrderChange={handleWorkOrderChange}
              />
            </TabsContent>
          ) : (
            <TabsContent value={activeTab} className="pt-4">
              <ActiveWorkDashboard 
                items={filteredItems}
                projectsLoading={projectsLoading}
                workOrdersLoading={workOrdersLoading}
                searchQuery={searchQuery}
                onWorkOrderChange={handleWorkOrderChange}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default ActiveWork;
