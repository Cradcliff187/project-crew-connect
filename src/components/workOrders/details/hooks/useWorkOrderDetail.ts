import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

interface Customer {
  name: string;
  email: string;
  phone: string;
}

interface Location {
  name: string;
  address: string;
}

interface Assignee {
  name: string;
}

interface CustomerData {
  customername: string;
  contactemail: string;
  phone: string;
}

interface LocationData {
  location_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface EmployeeData {
  first_name: string;
  last_name: string;
}

export const useWorkOrderDetail = (workOrderId?: string) => {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [assignee, setAssignee] = useState<Assignee | null>(null);
  const [isDataFetched, setIsDataFetched] = useState(false);

  const navigate = useNavigate();

  const fetchWorkOrder = useCallback(async () => {
    if (!workOrderId) {
      setLoading(false);
      return;
    }

    if (isDataFetched) return; // Prevent multiple fetches

    setLoading(true);
    try {
      // Fetch work order data
      const { data, error } = await supabase
        .from('maintenance_work_orders')
        .select('*')
        .eq('work_order_id', workOrderId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Work order not found');
      }

      // Cast the data properly to WorkOrder type
      const typedWorkOrder = data as WorkOrder;

      // Immediately set the work order to reduce perceived loading time
      setWorkOrder(typedWorkOrder);

      // Fetch all related data in parallel
      await Promise.all([
        fetchCustomerData(typedWorkOrder),
        fetchLocationData(typedWorkOrder),
        fetchAssigneeData(typedWorkOrder),
      ]);

      setIsDataFetched(true);
    } catch (error) {
      console.error('Error fetching work order:', error);
      toast({
        title: 'Error',
        description: `Could not load work order details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [workOrderId, isDataFetched]);

  const fetchCustomerData = async (workOrder: WorkOrder) => {
    if (!workOrder.customer_id) return null;

    try {
      const { data: customerData } = await supabase
        .from('customers')
        .select('customername, contactemail, phone')
        .eq('customerid', workOrder.customer_id)
        .single<CustomerData>();

      if (customerData) {
        setCustomer({
          name: customerData.customername,
          email: customerData.contactemail,
          phone: customerData.phone,
        });
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      // Don't throw - we want other data to load even if this fails
    }
  };

  const fetchLocationData = async (workOrder: WorkOrder) => {
    if (!workOrder.location_id) return null;

    try {
      const { data: locationData } = await supabase
        .from('site_locations')
        .select('location_name, address, city, state, zip')
        .eq('location_id', workOrder.location_id)
        .single<LocationData>();

      if (locationData) {
        setLocation({
          name: locationData.location_name,
          address: `${locationData.address}, ${locationData.city}, ${locationData.state} ${locationData.zip}`,
        });
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      // Don't throw - we want other data to load even if this fails
    }
  };

  const fetchAssigneeData = async (workOrder: WorkOrder) => {
    if (!workOrder.assigned_to) return null;

    try {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('first_name, last_name')
        .eq('employee_id', workOrder.assigned_to)
        .single<EmployeeData>();

      if (employeeData) {
        setAssignee({
          name: `${employeeData.first_name} ${employeeData.last_name}`,
        });
      }
    } catch (error) {
      console.error('Error fetching assignee data:', error);
      // Don't throw - we want other data to load even if this fails
    }
  };

  useEffect(() => {
    fetchWorkOrder();
  }, [workOrderId, fetchWorkOrder]);

  const handleBackClick = () => {
    navigate('/work-orders');
  };

  return {
    workOrder,
    loading,
    customer,
    location,
    assignee,
    fetchWorkOrder,
    handleBackClick,
  };
};
