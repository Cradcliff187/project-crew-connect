
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { WorkItem, projectToWorkItem, workOrderToWorkItem } from '@/types/activeWork';

export function useActiveWorkData() {
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
        status: order.status as any
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

  // Convert projects and work orders to unified WorkItem format
  const projectItems = projects.map(projectToWorkItem);
  const workOrderItems = workOrders.map(workOrderToWorkItem);
  
  // Combined items
  const allItems = [...projectItems, ...workOrderItems];

  const handleWorkOrderChange = () => {
    refetchWorkOrders();
  };

  return {
    projectItems,
    workOrderItems,
    allItems,
    projectsLoading,
    workOrdersLoading,
    projectsError,
    workOrdersError,
    handleWorkOrderChange
  };
}
