
import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

interface WorkOrderProgressCardProps {
  workOrder: WorkOrder;
  onProgressUpdate: () => void;
}

const WorkOrderProgressCard = ({ workOrder, onProgressUpdate }: WorkOrderProgressCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [progressValue, setProgressValue] = useState(workOrder.progress || 0);
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
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-row items-center justify-between w-full">
          <CardTitle>Progress</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-1" />
              Update
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={loading}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSaveProgress} disabled={loading} className="bg-[#0485ea] hover:bg-[#0375d1]">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Progress value={progressValue} className="h-4" />
            <span className="font-medium">{progressValue}%</span>
          </div>
          
          {isEditing && (
            <div className="mt-4">
              <label className="text-sm font-medium mb-1 block">Update Progress</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-24"
                  disabled={loading}
                />
                <span>%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Enter a value between 0 and 100</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderProgressCard;
