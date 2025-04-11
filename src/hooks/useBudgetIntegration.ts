
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createBudgetFromEstimate as convertEstimateItemsToBudgetItems } from '@/services/budgetIntegrationService';

/**
 * Hook for integrating estimate data with project budgets
 */
export const useBudgetIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Create budget items from an estimate for a project
   * 
   * @param projectId - The ID of the project 
   * @param estimateId - The ID of the estimate to convert
   * @returns Boolean indicating success or failure
   */
  const createBudgetFromEstimate = async (projectId: string, estimateId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Call the service function to convert estimate items to budget items
      const result = await convertEstimateItemsToBudgetItems(projectId, estimateId);
      
      if (result.success) {
        toast({
          title: "Budget Created",
          description: `Successfully created budget from estimate with ${result.message}`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create budget from estimate",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error in budget integration:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the budget",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createBudgetFromEstimate
  };
};
