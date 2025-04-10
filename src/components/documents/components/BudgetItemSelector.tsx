
import React, { useEffect, useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, EntityType } from '../schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';

interface BudgetItem {
  id: string;
  description: string;
  category: string;
}

interface BudgetItemSelectorProps {
  control: Control<DocumentUploadFormValues>;
  entityType: EntityType;
  entityId: string;
  prefillBudgetItemId?: string;
}

const BudgetItemSelector: React.FC<BudgetItemSelectorProps> = ({
  control,
  entityType,
  entityId,
  prefillBudgetItemId
}) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchBudgetItems = async () => {
      if (!entityId) return;
      
      setLoading(true);
      try {
        let projectId = entityId;
        
        // If this is a work order, get the linked project ID
        if (entityType === 'WORK_ORDER') {
          const { data: linkData } = await supabase
            .from('work_order_project_links')
            .select('project_id')
            .eq('work_order_id', entityId)
            .single();
            
          if (linkData?.project_id) {
            projectId = linkData.project_id;
          } else {
            // No linked project, so no budget items available
            setBudgetItems([]);
            setLoading(false);
            return;
          }
        }
        
        // Fetch budget items for the project
        const { data, error } = await supabase
          .from('project_budget_items')
          .select('id, description, category')
          .eq('project_id', projectId);
          
        if (error) {
          console.error('Error fetching budget items:', error);
          return;
        }
        
        setBudgetItems(data || []);
      } catch (error) {
        console.error('Error in budget item fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBudgetItems();
  }, [entityId, entityType]);
  
  // Set prefilled value when items load
  useEffect(() => {
    if (prefillBudgetItemId && budgetItems.length > 0) {
      // Check if the prefilled ID exists in our options
      const itemExists = budgetItems.some(item => item.id === prefillBudgetItemId);
      if (itemExists) {
        // Set the value in the form
        control._formValues.metadata.budgetItemId = prefillBudgetItemId;
      }
    }
  }, [budgetItems, prefillBudgetItemId, control._formValues]);
  
  if (budgetItems.length === 0) {
    return null;
  }
  
  return (
    <FormField
      control={control}
      name="metadata.budgetItemId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Budget Item</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value || 'none'}
            disabled={loading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a budget item" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {budgetItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.description} ({item.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default BudgetItemSelector;
