import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import PageTransition from '@/components/layout/PageTransition';

import WorkOrderDetails from '../WorkOrderDetails';
import { WorkOrder } from '@/types/workOrder';
import WorkOrderDocuments from '@/components/workOrders/documents';

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
          <WorkOrderDetails 
            workOrder={workOrder} 
            onStatusChange={handleRefresh} 
          />
        )}
      </div>
    </PageTransition>
  );
};

export default WorkOrderDetail;
