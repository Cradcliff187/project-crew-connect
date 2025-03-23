
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimateFormValues, EstimateItem } from '../schemas/estimateFormSchema';
import { 
  calculateItemCost, 
  calculateItemMarkup, 
  calculateItemPrice, 
  calculateItemGrossMargin, 
  calculateItemGrossMarginPercentage, 
  calculateSubtotal 
} from '../utils/estimateCalculations';

export const useEstimateSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitEstimate = async (data: EstimateFormValues, customers: { id: string; name: string }[], onSuccess: () => void) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting estimate with data:", data);
      
      // Make sure items match the EstimateItem type for calculations
      const typedItems: EstimateItem[] = data.items.map(item => ({
        cost: item.cost,
        markup_percentage: item.markup_percentage,
        quantity: item.quantity,
        item_type: item.item_type
      }));
      
      // Calculate the total amount
      const totalAmount = calculateSubtotal(typedItems);
      
      // Parse contingency percentage as a number (defaults to 0 if empty)
      const contingencyPercentage = parseFloat(data.contingency_percentage || '0');
      
      // Find the customer by ID to get the name
      const customer = customers.find(c => c.id === data.customer);
      const customerName = customer?.name || 'Unknown Client';
      console.log("Customer name for the estimate:", customerName);
      
      // Generate a temporary ID for TypeScript (the actual ID will be generated by the database trigger)
      // This is necessary because the TypeScript type requires estimateid, even though
      // the database will generate it via the set_estimate_id() trigger function
      const tempEstimateId = `EST-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      
      // Prepare the estimate data object with the proper field structure
      const estimateData = {
        estimateid: tempEstimateId, // Include this for TypeScript, the trigger will replace it
        customerid: data.customer,
        customername: customerName,
        "job description": data.description,
        estimateamount: totalAmount,
        contingency_percentage: contingencyPercentage,
        sitelocationaddress: data.location.address || '',
        sitelocationcity: data.location.city || '',
        sitelocationstate: data.location.state || '',
        sitelocationzip: data.location.zip || '',
        datecreated: new Date().toISOString(),
        status: 'draft',
        isactive: true,
        projectname: data.project
      };
      
      console.log("Submitting estimate data to Supabase:", estimateData);
      
      // Insert the estimate into the database
      const { data: insertedData, error: estimateError } = await supabase
        .from('estimates')
        .insert(estimateData)
        .select();

      if (estimateError) {
        console.error("Error inserting estimate:", estimateError);
        throw estimateError;
      }
      
      if (!insertedData || insertedData.length === 0) {
        throw new Error('Failed to create estimate - no ID returned');
      }
      
      console.log("Estimate created:", insertedData);
      const estimateId = insertedData[0].estimateid;

      // Prepare and insert the estimate items as expenses
      const estimateExpenses = data.items.map(item => {
        const typedItem: EstimateItem = {
          cost: item.cost,
          markup_percentage: item.markup_percentage,
          quantity: item.quantity || '1'
        };
        
        // Calculate all the derived values
        const cost = calculateItemCost(typedItem);
        const markupAmount = calculateItemMarkup(typedItem);
        const totalPrice = calculateItemPrice(typedItem);
        const grossMargin = calculateItemGrossMargin(typedItem);
        const grossMarginPercentage = calculateItemGrossMarginPercentage(typedItem);
        
        return {
          entity_type: 'ESTIMATE',
          entity_id: estimateId,
          expense_type: item.item_type || 'material',
          description: item.description,
          quantity: parseFloat(item.quantity || '1'),
          unit_price: totalPrice / (parseFloat(item.quantity || '1') || 1), // Unit price is the price per unit
          amount: totalPrice,
          vendor_id: item.item_type === 'vendor' ? item.vendor_id : null,
          notes: `Markup: ${item.markup_percentage || 0}%, Gross Margin: ${grossMarginPercentage}%`
        };
      });

      console.log("Inserting estimate expenses:", estimateExpenses);
      const { error: expensesError } = await supabase
        .from('expenses')
        .insert(estimateExpenses);

      if (expensesError) {
        console.error("Error inserting estimate expenses:", expensesError);
        throw expensesError;
      }

      // Show success message
      toast({
        title: "Success",
        description: `Estimate ${estimateId} has been created.`,
        variant: "default"
      });

      // Call the success callback
      onSuccess();
    } catch (error) {
      console.error('Error creating estimate:', error);
      
      // Provide a more informative error message when possible
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to create estimate. Please try again.";
        
      toast({
        title: "Error",
        description: errorMessage,
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
