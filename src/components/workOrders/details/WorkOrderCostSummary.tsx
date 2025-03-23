
// Create the necessary component to fix the time log query issue

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkOrder } from '@/types/workOrder';

interface WorkOrderCostSummaryProps {
  workOrder: WorkOrder;
}

const WorkOrderCostSummary: React.FC<WorkOrderCostSummaryProps> = ({ workOrder }) => {
  const [loading, setLoading] = useState(false);
  const [laborCost, setLaborCost] = useState(0);
  const [materialsCost, setMaterialsCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  
  useEffect(() => {
    // Set materials cost directly from work order
    setMaterialsCost(workOrder.materials_cost || 0);
    
    // Set total cost directly from work order
    setTotalCost(workOrder.total_cost || 0);
    
    // Calculate labor cost based on actual hours
    const calculatedLaborCost = (workOrder.actual_hours || 0) * 75; // Assume $75/hour
    setLaborCost(calculatedLaborCost);
    
  }, [workOrder]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  if (loading) {
    return <Skeleton className="h-[150px] w-full" />;
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Cost Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Labor:</span>
            <span className="font-medium">{formatCurrency(laborCost)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Materials:</span>
            <span className="font-medium">{formatCurrency(materialsCost)}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Cost:</span>
              <span className="font-bold text-[#0485ea]">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderCostSummary;
