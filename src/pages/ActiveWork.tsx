
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import PageHeader from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, ChevronDown, List, LayoutGrid } from 'lucide-react';
import ProjectsTable from '@/components/projects/ProjectsTable';
import WorkOrdersTable from '@/components/workOrders/WorkOrdersTable';
import { WorkOrder } from '@/types/workOrder';
import ActiveWorkDashboard from '@/components/activeWork/ActiveWorkDashboard';

const ActiveWork = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'dashboard'>('table');
  const [activeTab, setActiveTab] = useState('all');
  
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
      
      // Transform data to match our UI requirements
      return data.map(project => ({
        ...project,
        // Default values for fields not yet in database
        budget: Math.floor(Math.random() * 200000) + 50000, // Temporary random budget
        spent: Math.floor(Math.random() * 150000), // Temporary random spent amount
        progress: Math.floor(Math.random() * 100), // Temporary random progress
      }));
    },
    meta: {
      onError: (error: any) => {
        console.error('Error fetching projects:', error);
      }
    }
  });

  // Fetch work orders
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [workOrdersLoading, setWorkOrdersLoading] = useState(true);
  const [workOrdersError, setWorkOrdersError] = useState<string | null>(null);
  
  const fetchWorkOrders = async () => {
    setWorkOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_work_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Cast the status to StatusType to satisfy TypeScript
      const typedWorkOrders = data?.map(order => ({
        ...order,
        status: order.status as any
      })) || [];
      
      setWorkOrders(typedWorkOrders);
    } catch (error: any) {
      console.error('Error fetching work orders:', error);
      setWorkOrdersError(error.message);
      toast({
        title: 'Error fetching work orders',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setWorkOrdersLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWorkOrders();
  }, []);

  // Handle any errors from the project query
  useEffect(() => {
    if (projectsError) {
      toast({
        title: 'Error fetching projects',
        description: (projectsError as Error).message,
        variant: 'destructive'
      });
    }
  }, [projectsError]);

  const projectsErrorMessage = projectsError ? (projectsError as Error).message : null;

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
              placeholder="Search all work..." 
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
            <>
              <TabsContent value="all" className="space-y-6">
                <h3 className="text-lg font-semibold mt-4">Projects</h3>
                <ProjectsTable 
                  projects={projects}
                  loading={projectsLoading}
                  error={projectsErrorMessage}
                  searchQuery={searchQuery}
                />
                
                <h3 className="text-lg font-semibold mt-6">Work Orders</h3>
                <WorkOrdersTable 
                  workOrders={workOrders}
                  loading={workOrdersLoading}
                  error={workOrdersError}
                  searchQuery={searchQuery}
                  onStatusChange={fetchWorkOrders}
                />
              </TabsContent>
              
              <TabsContent value="projects">
                <ProjectsTable 
                  projects={projects}
                  loading={projectsLoading}
                  error={projectsErrorMessage}
                  searchQuery={searchQuery}
                />
              </TabsContent>
              
              <TabsContent value="workOrders">
                <WorkOrdersTable 
                  workOrders={workOrders}
                  loading={workOrdersLoading}
                  error={workOrdersError}
                  searchQuery={searchQuery}
                  onStatusChange={fetchWorkOrders}
                />
              </TabsContent>
            </>
          ) : (
            <TabsContent value={activeTab}>
              <ActiveWorkDashboard 
                projects={activeTab === 'workOrders' ? [] : projects}
                workOrders={activeTab === 'projects' ? [] : workOrders}
                projectsLoading={projectsLoading}
                workOrdersLoading={workOrdersLoading}
                searchQuery={searchQuery}
                onWorkOrderChange={fetchWorkOrders}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default ActiveWork;
