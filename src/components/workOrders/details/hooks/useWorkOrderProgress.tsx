
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { WorkOrder } from '@/types/workOrder';

export const useWorkOrderProgress = (workOrder: WorkOrder, onProgressUpdate: () => void) => {
  const [progressValue, setProgressValue] = useState(workOrder.progress || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSaveProgress = async () => {
    setLoading(true);
    try {
      // Ensure the progress value is between 0 and 100
      const normalizedProgress = Math.min(Math.max(progressValue, 0), 100);
      
      const { error } = await supabase
        .from('maintenance_work_orders')
        .update({ progress: normalizedProgress })
        .eq('work_order_id', workOrder.work_order_id);
      
      if (error) throw error;
      
      toast({
        title: 'Progress updated',
        description: `Work order progress has been updated to ${normalizedProgress}%.`,
      });
      
      onProgressUpdate();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error updating progress',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    setProgressValue(workOrder.progress || 0);
    setIsEditing(false);
  };
  
  const startEditing = () => {
    setIsEditing(true);
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
