import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

interface UseEstimateFormDataProps {
  open: boolean;
  customerId: string;
  isNewCustomer?: boolean;
}

export const useEstimateFormData = ({
  open,
  customerId,
  isNewCustomer,
}: UseEstimateFormDataProps) => {
  const [customers, setCustomers] = useState<
    { id: string; name: string; address?: string; city?: string; state?: string; zip?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomerAddress, setSelectedCustomerAddress] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);

  // Debounce the customerId to prevent multiple rapid fetches
  const debouncedCustomerId = useDebounce(customerId, 300);

  // Fetch customers when the form opens
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('customers')
          .select('customerid, customername, address, city, state, zip')
          .order('customername');

        if (error) throw error;

        setCustomers(
          data?.map(c => ({
            id: c.customerid,
            name: c.customername || '',
            address: c.address,
            city: c.city,
            state: c.state,
            zip: c.zip,
          })) || []
        );
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

  // Fetch customer address when customer is selected
  useEffect(() => {
    if (debouncedCustomerId && !isNewCustomer) {
      const selectedCustomer = customers.find(c => c.id === debouncedCustomerId);

      if (selectedCustomer) {
        setSelectedCustomerName(selectedCustomer.name);

        if (selectedCustomer.address && selectedCustomer.city && selectedCustomer.state) {
          const formattedAddress =
            `${selectedCustomer.address}, ${selectedCustomer.city}, ${selectedCustomer.state} ${selectedCustomer.zip || ''}`.trim();
          setSelectedCustomerAddress(formattedAddress);
        } else {
          setSelectedCustomerAddress(null);
        }
      }
    } else {
      setSelectedCustomerAddress(null);
      setSelectedCustomerName(null);
    }
  }, [debouncedCustomerId, customers, isNewCustomer]);

  return {
    customers,
    loading,
    selectedCustomerAddress,
    selectedCustomerName,
  };
};
