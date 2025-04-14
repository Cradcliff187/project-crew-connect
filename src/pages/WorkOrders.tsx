import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import WorkOrdersHeader from '@/components/workOrders/WorkOrdersHeader';
import WorkOrdersTable from '@/components/workOrders/WorkOrdersTable';
import { WorkOrder } from '@/types/workOrder';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

const fetchWorkOrders = async () => {
  const { data, error } = await supabase
    .from('maintenance_work_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  // Cast the data properly to match the WorkOrder type
  const typedWorkOrders = data?.map(order => ({
    ...order,
    status: order.status as WorkOrder['status'], // Use the proper type from WorkOrder
  })) as WorkOrder[];

  return typedWorkOrders;
};

const WorkOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for openNewWorkOrder query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('openNewWorkOrder') === 'true') {
      setShowAddDialog(true);
      // Remove the query parameter from the URL to prevent reopening on refresh
      navigate('/work-orders', { replace: true });
    }
  }, [location, navigate]);

  const {
    data: workOrders = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['workOrders'],
    queryFn: fetchWorkOrders,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching work orders:', error);
        toast({
          title: 'Error fetching work orders',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  // Function to trigger refresh of work orders
  const handleWorkOrderAdded = () => {
    refetch();
  };

  // Function to handle status changes
  const handleStatusChange = () => {
    refetch();
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <WorkOrdersHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onWorkOrderAdded={handleWorkOrderAdded}
          showAddDialog={showAddDialog}
          setShowAddDialog={setShowAddDialog}
        />

        <div className="mt-6">
          <WorkOrdersTable
            workOrders={workOrders}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default WorkOrders;
