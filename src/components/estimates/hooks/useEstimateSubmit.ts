
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

export interface UseEstimateSubmitProps {
  onSuccess?: () => void;
}

export const useEstimateSubmit = ({ onSuccess }: UseEstimateSubmitProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles the submission of a new estimate
   */
  const submitEstimate = async (data: EstimateFormValues): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      console.log('Submitting estimate with data:', data);

      // First, handle creating a customer if it's a new one
      let customerId = data.customer;
      if (data.isNewCustomer && data.customerName) {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .insert({
            customername: data.customerName,
            address: data.customerAddress,
            city: data.customerCity,
            state: data.customerState,
            zip: data.customerZip,
            contactname: data.customerContactName,
            contactemail: data.customerEmail,
            phone: data.customerPhone,
          })
          .select('customerid')
          .single();

        if (customerError) {
          throw new Error(`Failed to create customer: ${customerError.message}`);
        }

        customerId = customerData.customerid;
      }

      // Create a new estimate with the validated customer ID
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          customer_id: customerId,
          project_name: data.project,
          description: data.description,
          location_address: data.jobAddress,
          location_city: data.jobCity,
          location_state: data.jobState,
          location_zip: data.jobZip,
          status: 'DRAFT',
          total_amount: data.total || 0,
          subtotal: data.subtotal || 0,
          contingency: data.contingency || 0,
          tax_rate: data.taxRate || 0,
          tax_amount: data.taxAmount || 0,
        })
        .select('estimate_id')
        .single();

      if (estimateError) {
        throw new Error(`Failed to create estimate: ${estimateError.message}`);
      }

      // Insert estimate line items
      if (data.items && data.items.length > 0) {
        const lineItems = data.items.map((item) => ({
          estimate_id: estimateData.estimate_id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          amount: item.amount,
        }));

        const { error: lineItemsError } = await supabase
          .from('estimate_line_items')
          .insert(lineItems);

        if (lineItemsError) {
          throw new Error(`Failed to create line items: ${lineItemsError.message}`);
        }
      }

      // Success notification
      toast({
        title: 'Estimate Created',
        description: 'The estimate has been successfully created.',
      });

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to estimates list
        navigate('/estimates');
      }

      return true;
    } catch (error: any) {
      console.error('Error creating estimate:', error);
      
      toast({
        title: 'Error Creating Estimate',
        description: error.message || 'There was an error creating the estimate. Please try again.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitEstimate,
    isSubmitting,
  };
};

export default useEstimateSubmit;
