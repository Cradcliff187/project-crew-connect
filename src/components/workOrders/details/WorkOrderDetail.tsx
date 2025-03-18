
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Package, CalendarCheck, ClipboardList, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, formatCurrency } from '@/lib/utils';
import PageTransition from '@/components/layout/PageTransition';

import WorkOrderHeader from './WorkOrderHeader';
import WorkOrderTimelogs from '../WorkOrderTimelogs';
import WorkOrderMaterials from '../WorkOrderMaterials';
import WorkOrderCostSummary from './WorkOrderCostSummary';
import WorkOrderStatus from './WorkOrderStatus';
import WorkOrderProjectLink from '../WorkOrderProjectLink';

import { WorkOrder } from '@/types/workOrder';

const WorkOrderDetail = () => {
  const { workOrderId } = useParams<{ workOrderId: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWorkOrder = async () => {
      if (!workOrderId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('maintenance_work_orders')
          .select('*')
          .eq('work_order_id', workOrderId)
          .single();
        
        if (error) throw error;
        
        setWorkOrder(data as WorkOrder);
      } catch (error: any) {
        console.error('Error fetching work order:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load work order details.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkOrder();
  }, [workOrderId]);
  
  const handleBackClick = () => {
    navigate('/work-orders');
  };
  
  const handleRefresh = () => {
    if (workOrderId) {
      setLoading(true);
      supabase
        .from('maintenance_work_orders')
        .select('*')
        .eq('work_order_id', workOrderId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error refreshing work order:', error);
            return;
          }
          
          setWorkOrder(data as WorkOrder);
          setLoading(false);
        });
    }
  };
  
  return (
    <PageTransition>
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Orders
        </Button>
        
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-14 w-full" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !workOrder ? (
          <Card className="py-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Work Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The work order you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={handleBackClick}>Return to Work Orders</Button>
            </div>
          </Card>
        ) : (
          <>
            <WorkOrderHeader workOrder={workOrder} onUpdate={handleRefresh} />
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <StatusBadge status={workOrder.status} />
                  </div>
                  <WorkOrderStatus 
                    workOrder={workOrder} 
                    onStatusChange={handleRefresh} 
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <CalendarCheck className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Scheduled For</div>
                      <div className="font-semibold">
                        {workOrder.scheduled_date 
                          ? formatDate(workOrder.scheduled_date) 
                          : 'Not scheduled'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Estimated:</span>
                    <span className="font-medium">
                      {workOrder.time_estimate 
                        ? `${workOrder.time_estimate} hours` 
                        : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Actual:</span>
                    <span className="font-medium">
                      {workOrder.actual_hours 
                        ? `${workOrder.actual_hours} hours` 
                        : '0 hours'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {workOrder.description ? (
                    <p>{workOrder.description}</p>
                  ) : (
                    <p className="text-muted-foreground">No description provided.</p>
                  )}
                </CardContent>
              </Card>
              
              <WorkOrderProjectLink 
                workOrderId={workOrder.work_order_id} 
                onLinkComplete={handleRefresh}
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <Tabs defaultValue="materials">
                  <TabsList>
                    <TabsTrigger value="materials">
                      <Package className="h-4 w-4 mr-2" />
                      Materials
                    </TabsTrigger>
                    <TabsTrigger value="time">
                      <Clock className="h-4 w-4 mr-2" />
                      Time Tracking
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="materials" className="mt-6">
                    <WorkOrderMaterials workOrderId={workOrder.work_order_id} />
                  </TabsContent>
                  
                  <TabsContent value="time" className="mt-6">
                    <WorkOrderTimelogs workOrderId={workOrder.work_order_id} />
                  </TabsContent>
                </Tabs>
              </div>
              
              <div>
                <WorkOrderCostSummary workOrder={workOrder} />
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default WorkOrderDetail;
