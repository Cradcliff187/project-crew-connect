
import { useState } from 'react';
import * as budgetIntegrationService from '@/services/budgetIntegrationService';
import { toast } from '@/hooks/use-toast';

export const useBudgetIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const createBudgetFromEstimate = async (projectId: string, estimateId: string) => {
    setIsLoading(true);
    try {
      const success = await budgetIntegrationService.createBudgetFromEstimate(projectId, estimateId);
      
      if (success) {
        toast({
          title: 'Budget Created',
          description: 'Initial budget items have been created from the estimate.',
        });
        return true;
      } else {
        toast({
          title: 'Budget Creation Failed',
          description: 'Could not create budget items from the estimate.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error in createBudgetFromEstimate:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while creating the budget.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const linkWorkOrderToProject = async (workOrderId: string, projectId: string, budgetItemId?: string) => {
    setIsLoading(true);
    try {
      const success = await budgetIntegrationService.linkWorkOrderToProject(
        workOrderId, 
        projectId, 
        budgetItemId
      );
      
      if (success) {
        toast({
          title: 'Work Order Linked',
          description: 'Work order has been linked to the project budget.',
        });
        return true;
      } else {
        toast({
          title: 'Link Failed',
          description: 'Could not link work order to the project budget.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error in linkWorkOrderToProject:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while linking the work order.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const importWorkOrderCosts = async (workOrderId: string, projectId: string) => {
    setIsLoading(true);
    try {
      const success = await budgetIntegrationService.importWorkOrderCostsToProject(workOrderId, projectId);
      
      if (success) {
        toast({
          title: 'Costs Imported',
          description: 'Work order costs have been imported to the project budget.',
        });
        return true;
      } else {
        toast({
          title: 'Import Failed',
          description: 'Could not import work order costs to the project budget.',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error in importWorkOrderCosts:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while importing costs.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    createBudgetFromEstimate,
    linkWorkOrderToProject,
    importWorkOrderCosts
  };
};
