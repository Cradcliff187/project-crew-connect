import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { ChangeOrder, ChangeOrderEntityType, ChangeOrderStatus } from '@/types/changeOrders';
import FinancialImpactSummary from './FinancialImpactSummary';
import BudgetImpactAnalysis from './BudgetImpactAnalysis';
import ScheduleImpactVisualization from './ScheduleImpactVisualization';
import { Skeleton } from '@/components/ui/skeleton';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface FinancialAnalysisTabProps {
  form: UseFormReturn<ChangeOrder>;
  entityType: ChangeOrderEntityType;
  entityId: string;
}

const FinancialAnalysisTab: React.FC<FinancialAnalysisTabProps> = ({
  form,
  entityType,
  entityId,
}) => {
  const [originalContractValue, setOriginalContractValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Watch the items field array for real-time updates
  const items = form.watch('items') || [];

  // Calculate current impacts based on watched items
  const currentCostImpact = items.reduce(
    (sum, item) => sum + (item?.cost || 0) * (item?.quantity || 0),
    0
  );
  const currentTotalAmount = items.reduce((sum, item) => sum + (item?.total_price || 0), 0);

  // Fetch the original contract value from the project or work order
  useEffect(() => {
    const fetchContractValue = async () => {
      setLoading(true);
      try {
        let value = 0;

        if (entityType === 'PROJECT') {
          const { data, error } = await supabase
            .from('projects')
            .select('total_budget')
            .eq('projectid', entityId)
            .single();

          if (error) throw error;
          value = data?.total_budget || 0;
        } else {
          const { data, error } = await supabase
            .from('maintenance_work_orders')
            .select('total_cost')
            .eq('work_order_id', entityId)
            .single();

          if (error) throw error;
          value = data?.total_cost || 0;
        }

        setOriginalContractValue(value);
      } catch (error) {
        console.error('Error fetching contract value:', error);
      } finally {
        setLoading(false);
      }
    };

    if (entityId) {
      fetchContractValue();
    }
  }, [entityId, entityType]);

  // Pass the WATCHED/CALCULATED values to the summary component
  const changeOrderForSummary = {
    ...form.getValues(), // Get other CO fields
    cost_impact: currentCostImpact, // Override with calculated value
    total_amount: currentTotalAmount, // Override with calculated value
    items: items, // Pass current items array
  };

  if (loading) {
    return (
      <div className="space-y-4 my-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 my-4">
      <FinancialImpactSummary
        changeOrder={changeOrderForSummary}
        originalContractValue={originalContractValue}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <BudgetImpactAnalysis items={changeOrderForSummary.items || []} />
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalysisTab;
