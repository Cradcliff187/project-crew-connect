
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseEstimateFormDataProps {
  open: boolean;
  customerId: string;
}

export const useEstimateFormData = ({ open, customerId }: UseEstimateFormDataProps) => {
  const [customers, setCustomers] = useState<{ id: string; name: string; address?: string; city?: string; state?: string; zip?: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomerAddress, setSelectedCustomerAddress] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);

  // Fetch customers when the dialog opens
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('customerid, customername, address, city, state, zip')
          .order('customername');
          
        if (error) throw error;
        setCustomers(data?.map(c => ({ 
          id: c.customerid, 
          name: c.customername || '',
          address: c.address,
          city: c.city,
          state: c.state,
          zip: c.zip
        })) || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  // Update selected customer details when customer ID changes
  useEffect(() => {
    if (customerId) {
      const selectedCustomer = customers.find(c => c.id === customerId);
      
      if (selectedCustomer) {
        setSelectedCustomerName(selectedCustomer.name);
        
        if (selectedCustomer.address && selectedCustomer.city && selectedCustomer.state) {
          const formattedAddress = `${selectedCustomer.address}, ${selectedCustomer.city}, ${selectedCustomer.state} ${selectedCustomer.zip || ''}`.trim();
          setSelectedCustomerAddress(formattedAddress);
        } else {
          setSelectedCustomerAddress(null);
        }
      }
    } else {
      setSelectedCustomerAddress(null);
      setSelectedCustomerName(null);
    }
  }, [customerId, customers]);

  return {
    customers,
    loading,
    selectedCustomerAddress,
    selectedCustomerName,
  };
};
