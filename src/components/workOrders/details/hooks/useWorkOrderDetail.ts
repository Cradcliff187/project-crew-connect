
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { WorkOrder } from '@/types/workOrder';

export function useWorkOrderDetail(workOrderId: string | undefined) {
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [location, setLocation] = useState<{ name: string; address: string } | null>(null);
  const [assignee, setAssignee] = useState<{ name: string } | null>(null);
  
  const fetchWorkOrder = async () => {
    if (!workOrderId) return;
    
    setLoading(true);
    try {
      // Fetch the work order - ensure we use proper UUID filtering
      const { data, error } = await supabase
        .from('maintenance_work_orders')
        .select('*')
        .eq('work_order_id', workOrderId)
        .single();
      
      if (error) throw error;
      
      setWorkOrder(data as WorkOrder);
      
      // Fetch related data
      if (data.customer_id) {
        await fetchCustomer(data.customer_id);
      }
      
      if (data.location_id) {
        await fetchLocation(data.location_id);
      }
      
      if (data.assigned_to) {
        await fetchAssignee(data.assigned_to);
      }
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
  
  const fetchCustomer = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('customername, contactemail, phone')
        .eq('customerid', customerId)
        .single();
      
      if (error) throw error;
      
      setCustomer({
        name: data.customername || 'Unknown Customer',
        email: data.contactemail || '',
        phone: data.phone || '',
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  };
  
  const fetchLocation = async (locationId: string) => {
    try {
      // Properly handle UUID filtering for location
      const { data, error } = await supabase
        .from('site_locations')
        .select('location_name, address, city, state, zip')
        .eq('location_id', locationId)
        .single();
      
      if (error) throw error;
      
      const fullAddress = [
        data.address,
        data.city,
        data.state,
        data.zip
      ].filter(Boolean).join(', ');
      
      setLocation({
        name: data.location_name || 'Unknown Location',
        address: fullAddress,
      });
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };
  
  const fetchAssignee = async (employeeId: string) => {
    try {
      // Properly handle UUID filtering for employee
      const { data, error } = await supabase
        .from('employees')
        .select('first_name, last_name')
        .eq('employee_id', employeeId)
        .single();
      
      if (error) throw error;
      
      setAssignee({
        name: `${data.first_name} ${data.last_name}`,
      });
    } catch (error) {
      console.error('Error fetching assignee:', error);
    }
  };
  
  const handleBackClick = () => {
    navigate('/work-orders');
  };
  
  useEffect(() => {
    fetchWorkOrder();
  }, [workOrderId]);
  
  return {
    workOrder,
    loading,
    customer,
    location,
    assignee,
    fetchWorkOrder,
    handleBackClick
  };
}
