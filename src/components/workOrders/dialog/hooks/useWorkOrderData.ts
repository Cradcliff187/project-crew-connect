
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface FormData {
  customers: { customerid: string; customername: string }[];
  locations: { location_id: string; location_name: string }[];
  employees: { employee_id: string; first_name: string; last_name: string }[];
}

export const useWorkOrderData = () => {
  const [formData, setFormData] = useState<FormData>({
    customers: [],
    locations: [],
    employees: []
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      console.log('Fetching form data...');
      setIsLoading(true);
      setDataLoaded(false);
      setError(null);

      // Fetch customers data
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('customerid, customername')
        .order('customername');
      
      if (customersError) {
        console.error('Error fetching customers:', customersError);
        toast({
          title: 'Error fetching customers',
          description: customersError.message,
          variant: 'destructive',
        });
        setError(customersError.message);
        return; 
      }

      console.log('Customers data fetched successfully:', customersData);
      
      // Create customers array with proper fallback
      const customers = Array.isArray(customersData) ? customersData : [];
      
      // Fetch locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('site_locations')
        .select('location_id, location_name')
        .eq('is_active', true)
        .order('location_name');
      
      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
        toast({
          title: 'Error fetching locations',
          description: locationsError.message,
          variant: 'destructive',
        });
        setError(locationsError.message);
      }
      
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('employee_id, first_name, last_name')
        .eq('status', 'ACTIVE')
        .order('last_name');
      
      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        toast({
          title: 'Error fetching employees',
          description: employeesError.message,
          variant: 'destructive',
        });
        setError(employeesError.message);
      }
      
      const updatedFormData = {
        customers: customers,
        locations: Array.isArray(locationsData) ? locationsData : [],
        employees: Array.isArray(employeesData) ? employeesData : []
      };
      
      console.log('Setting form data:', updatedFormData);
      setFormData(updatedFormData);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load necessary data. Please try again.');
      toast({
        title: 'Error fetching form data',
        description: 'Failed to load necessary data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Automatically fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  return {
    formData,
    dataLoaded,
    isLoading,
    error,
    fetchData
  };
};
