
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import workOrderSchema, { WorkOrderFormValues } from './WorkOrderFormSchema';

interface UseWorkOrderFormProps {
  onOpenChange: (open: boolean) => void;
  onWorkOrderAdded: () => void;
}

interface FormData {
  customers: { customerid: string; customername: string }[];
  locations: { location_id: string; location_name: string }[];
  employees: { employee_id: string; first_name: string; last_name: string }[];
}

const useWorkOrderForm = ({ onOpenChange, onWorkOrderAdded }: UseWorkOrderFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customers: [],
    locations: [],
    employees: []
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      po_number: '',
      time_estimate: 0,
      use_custom_address: false,
      address: '',
      city: '',
      state: '',
      zip: '',
    },
  });

  const useCustomAddress = form.watch('use_custom_address');

  const fetchData = async () => {
    try {
      console.log('Fetching form data...');
      setDataLoaded(false);

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
        return; // Exit early on error
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
      toast({
        title: 'Error fetching form data',
        description: 'Failed to load necessary data. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Automatically fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);
  
  const onSubmit = async (values: WorkOrderFormValues) => {
    setIsSubmitting(true);
    
    try {
      // First handle creating a new location if custom address is used
      let locationId = values.location_id;

      if (values.use_custom_address && values.address) {
        // Insert a new location and get the ID
        const { data: newLocation, error: locationError } = await supabase
          .from('site_locations')
          .insert({
            location_name: `${values.address}, ${values.city || ''} ${values.state || ''} ${values.zip || ''}`.trim(),
            address: values.address,
            city: values.city,
            state: values.state,
            zip: values.zip,
            customer_id: values.customer_id || null,
            is_active: true
          })
          .select('location_id')
          .single();
        
        if (locationError) {
          throw locationError;
        }
        
        if (newLocation) {
          locationId = newLocation.location_id;
        }
      }

      // Now create the work order with either the selected or newly created location
      const { error } = await supabase
        .from('maintenance_work_orders')
        .insert({
          title: values.title,
          description: values.description,
          priority: values.priority,
          po_number: values.po_number,
          time_estimate: values.time_estimate,
          scheduled_date: values.scheduled_date ? values.scheduled_date.toISOString() : null,
          customer_id: values.customer_id || null,
          location_id: locationId || null,
          assigned_to: values.assigned_to || null,
          status: 'NEW',
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Work Order Created',
        description: 'The work order has been created successfully.',
      });
      
      onWorkOrderAdded();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Error creating work order:', error);
      toast({
        title: 'Error Creating Work Order',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    formData,
    useCustomAddress,
    fetchData,
    onSubmit,
    dataLoaded
  };
};

export default useWorkOrderForm;
