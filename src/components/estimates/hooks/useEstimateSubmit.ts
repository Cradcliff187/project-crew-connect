
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import { submitEstimateToDatabase, submitEstimateItems } from '../utils/estimateSubmissionUtils';

export const useEstimateSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitEstimate = async (data: EstimateFormValues, customers: { id: string; name: string }[], onSuccess: () => void) => {
    try {
      setIsSubmitting(true);
      
      // Submit the estimate to get an ID
      const estimateId = await submitEstimateToDatabase(data, customers);
      
      // Submit the estimate items with the new estimate ID
      await submitEstimateItems(data, estimateId);

      // Show success message with the proper toast function
      toast({
        title: "Estimate Created",
        description: `Estimate ${estimateId} has been successfully created.`,
        variant: "success",
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
