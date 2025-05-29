import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Clock, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
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
  const { user } = useAuth();

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

  // Calculate metrics for summary cards
  const totalWorkOrders = workOrders.length;
  const inProgress = workOrders.filter(
    wo => wo.status === 'IN_PROGRESS' || wo.status === 'ACTIVE'
  ).length;
  const completed = workOrders.filter(wo => wo.status === 'COMPLETED').length;
  const urgent = workOrders.filter(wo => wo.priority === 'HIGH' || wo.priority === 'URGENT').length;

  // Function to trigger refresh of work orders
  const handleWorkOrderAdded = () => {
    refetch();
  };

  // Function to handle status changes
  const handleStatusChange = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center font-montserrat">
              <Wrench className="h-8 w-8 mr-3 text-blue-600" />
              Work Orders Management
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 font-opensans"
            >
              {user?.role || 'User'}
            </Badge>
          </div>
          <p className="text-gray-600 font-opensans">Manage maintenance and service work orders</p>
        </div>

        {/* Summary Cards - Horizontal Layout for Desktop */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium font-opensans">
                    Total Work Orders
                  </p>
                  <p className="text-2xl font-bold text-blue-900 font-montserrat">
                    {totalWorkOrders}
                  </p>
                </div>
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium font-opensans">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-900 font-montserrat">{inProgress}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium font-opensans">Completed</p>
                  <p className="text-2xl font-bold text-green-900 font-montserrat">{completed}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium font-opensans">Urgent</p>
                  <p className="text-2xl font-bold text-red-900 font-montserrat">{urgent}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Maximum Space for Work Order Data */}
        <PageTransition>
          <div className="flex flex-col">
            <WorkOrdersHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onWorkOrderAdded={handleWorkOrderAdded}
              showAddDialog={showAddDialog}
              setShowAddDialog={setShowAddDialog}
            />

            <div className="mt-4">
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
      </div>
    </div>
  );
};

export default WorkOrders;
