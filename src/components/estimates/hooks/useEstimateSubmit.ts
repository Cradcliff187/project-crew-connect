
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimateFormValues, EstimateItem } from '../schemas/estimateFormSchema';
import { calculateSubtotal } from '../utils/estimateCalculations';

export const useEstimateSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitEstimate = async (data: EstimateFormValues, clients: { id: string; name: string }[], onSuccess: () => void) => {
    try {
      setIsSubmitting(true);
      
      // Make sure items match the EstimateItem type for calculations
      const typedItems: EstimateItem[] = data.items.map(item => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }));
      
      // Calculate the total amount
      const totalAmount = calculateSubtotal(typedItems);
      const contingencyPercentage = parseFloat(data.contingency_percentage || '0');
      
      // Insert the estimate into the database
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          customerid: data.client,
          customername: clients.find(c => c.id === data.client)?.name || '',
          "job description": data.description, // Note the space in column name
          estimateamount: totalAmount,
          contingency_percentage: contingencyPercentage,
          sitelocationaddress: data.location.address,
          sitelocationcity: data.location.city,
          sitelocationstate: data.location.state,
          sitelocationzip: data.location.zip,
          datecreated: new Date().toISOString(),
          status: 'draft',
          isactive: true,
          // Field names that match what's in the database
          projectname: data.project
        })
        .select();

      if (estimateError) throw estimateError;
      
      if (!estimateData || estimateData.length === 0) {
        throw new Error('Failed to create estimate - no ID returned');
      }
      
      const estimateId = estimateData[0].estimateid;

      // Insert the estimate items
      const estimateItems = data.items.map(item => ({
        estimate_id: estimateId,
        description: item.description,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unitPrice),
        total_price: parseFloat(item.quantity) * parseFloat(item.unitPrice)
      }));

      const { error: itemsError } = await supabase
        .from('estimate_items')
        .insert(estimateItems);

      if (itemsError) throw itemsError;

      // Show success message
      toast({
        title: "Success",
        description: `Estimate ${estimateId} has been created.`,
      });

      // Call the success callback
      onSuccess();
    } catch (error) {
      console.error('Error creating estimate:', error);
      toast({
        title: "Error",
        description: "Failed to create estimate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitEstimate
  };
};
