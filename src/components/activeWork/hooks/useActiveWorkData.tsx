
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { WorkItem, projectToWorkItem } from '@/types/activeWork';
import { WorkOrder } from '@/types/workOrder';

export function useActiveWorkData(limit?: number) {
  // Fetch projects
  const { 
    data: projects = [], 
    isLoading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects
  } = useQuery({
    queryKey: ['projects', { limit }],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('projectid, projectname, customername, customerid, status, createdon, due_date')
        
      // If limit is provided, order by due_date and limit results
      if (limit) {
        query = query
          .order('due_date', { ascending: true, nullsFirst: false })
          .limit(limit);
      } else {
        query = query.order('createdon', { ascending: false });
      }
      
      const { data, error } = await query;
      
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
        toast({
          title: 'Error fetching projects',
          description: error.message,
          variant: 'destructive'
        });
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
    queryKey: ['workOrders', { limit }],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_work_orders')
        .select('*')
      
      // If limit is provided, order by scheduled_date and limit results
      if (limit) {
        query = query
          .order('scheduled_date', { ascending: true, nullsFirst: false })
          .limit(limit);
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Ensure we properly type the work orders to match the WorkOrder interface
      const typedWorkOrders = data?.map(order => ({
        ...order,
        status: order.status as WorkOrder['status'],
        priority: order.priority as WorkOrder['priority']
      })) as WorkOrder[];
      
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

  // Helper function to convert work orders to WorkItem type
  const workOrderToWorkItem = (workOrder: WorkOrder): WorkItem => {
    return {
      id: workOrder.work_order_id,
      title: workOrder.title,
      type: 'workOrder',
      status: workOrder.status,
      dueDate: workOrder.due_by_date,
      customerName: '',  // This would need to be populated from customer data
      progress: workOrder.progress,
      href: `/work-orders/${workOrder.work_order_id}`
    };
  };

  // Convert projects and work orders to unified WorkItem format
  const projectItems = projects.map(projectToWorkItem);
  const workOrderItems = workOrders.map((wo) => workOrderToWorkItem(wo));
  
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
