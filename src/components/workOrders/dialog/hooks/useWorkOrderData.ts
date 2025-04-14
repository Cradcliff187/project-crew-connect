import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FormData {
  customers: Array<{ customerid: string; customername: string }>;
  locations: Array<{ location_id: string; location_name: string; address: string }>;
  employees: Array<{ employee_id: string; first_name: string; last_name: string }>;
}

export const useWorkOrderData = (dialogOpen: boolean) => {
  const [formData, setFormData] = useState<FormData>({
    customers: [],
    locations: [],
    employees: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!dialogOpen) return;

      setIsLoading(true);
      try {
        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('customerid, customername')
          .order('customername');

        if (customersError) throw customersError;

        // Fetch locations
        const { data: locationsData, error: locationsError } = await supabase
          .from('site_locations')
          .select('location_id, location_name, address, city, state, zip')
          .order('location_name');

        if (locationsError) throw locationsError;

        // Fetch employees for assignment
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name')
          .eq('status', 'ACTIVE')
          .order('first_name');

        if (employeesError) throw employeesError;

        setFormData({
          customers: customersData || [],
          locations: locationsData || [],
          employees: employeesData || [],
        });

        setDataLoaded(true);
      } catch (error: any) {
        console.error('Error fetching form data:', error);
        toast({
          title: 'Error loading data',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [dialogOpen]);

  return { formData, isLoading, dataLoaded };
};

export default useWorkOrderData;
