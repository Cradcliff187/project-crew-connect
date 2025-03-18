
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import WorkOrdersHeader from '@/components/workOrders/WorkOrdersHeader';
import WorkOrdersTable from '@/components/workOrders/WorkOrdersTable';
import { WorkOrder } from '@/types/workOrder';

const WorkOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch work orders from Supabase
  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_work_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setWorkOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching work orders:', error);
      setError(error.message);
      toast({
        title: 'Error fetching work orders',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleWorkOrderAdded = () => {
    fetchWorkOrders();
  };

  const handleStatusChange = async () => {
    fetchWorkOrders();
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <WorkOrdersHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onWorkOrderAdded={handleWorkOrderAdded}
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
