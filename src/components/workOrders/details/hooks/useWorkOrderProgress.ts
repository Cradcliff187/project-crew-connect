
import { useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useWorkOrderProgress = (
  workOrder: WorkOrder,
  onProgressUpdate: () => void
) => {
  const [progressValue, setProgressValue] = useState<number>(workOrder.progress || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const startEditing = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setProgressValue(workOrder.progress || 0);
    setIsEditing(false);
  };
  
  const handleSaveProgress = async () => {
    setLoading(true);
    
    try {
      // Check if progress is 100, and if so, mark the work order as COMPLETED
      const newStatus = progressValue === 100 ? 'COMPLETED' : workOrder.status;
      
      // Update progress and status if needed
      const { error } = await supabase
        .from('maintenance_work_orders')
        .update({
          progress: progressValue,
          status: newStatus,
          ...(newStatus === 'COMPLETED' ? { completed_date: new Date().toISOString() } : {})
        })
        .eq('work_order_id', workOrder.work_order_id);
        
      if (error) {
        throw error;
      }
      
      // If status changed, log it in the status history table
      if (newStatus !== workOrder.status) {
        await supabase.from('work_order_status_history').insert({
          work_order_id: workOrder.work_order_id,
          previous_status: workOrder.status,
          status: newStatus,
          notes: `Status changed to ${newStatus} due to progress update to ${progressValue}%`
        });
      }
      
      toast({
        title: 'Progress Updated',
        description: `Work order progress updated to ${progressValue}%`,
      });
      
      // Call the refresh function
      onProgressUpdate();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: `Failed to update progress: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return {
    progressValue,
    setProgressValue,
    isEditing,
    loading,
    startEditing,
    handleSaveProgress,
    handleCancelEdit
  };
};
