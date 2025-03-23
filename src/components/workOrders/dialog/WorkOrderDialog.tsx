
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

interface WorkOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder?: WorkOrder;
  onWorkOrderSaved: () => void;
}

const WorkOrderDialog = ({ isOpen, onClose, workOrder, onWorkOrderSaved }: WorkOrderDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!workOrder;
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: workOrder || {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'NEW',
      progress: 0
    }
  });

  // Reset form when dialog opens/closes or when workOrder changes
  React.useEffect(() => {
    if (isOpen) {
      reset(workOrder || {
        title: '',
        description: '',
        priority: 'MEDIUM',
        status: 'NEW',
        progress: 0
      });
    }
  }, [isOpen, workOrder, reset]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      
      if (isEditing) {
        // Update existing work order
        const { error } = await supabase
          .from('maintenance_work_orders')
          .update({
            title: data.title,
            description: data.description,
            priority: data.priority,
            status: data.status,
            updated_at: new Date().toISOString()
          })
          .eq('work_order_id', workOrder.work_order_id);
          
        if (error) throw error;
        
        toast({
          title: 'Work Order Updated',
          description: 'The work order has been updated successfully.',
          className: 'bg-[#0485ea]',
        });
      } else {
        // Create new work order
        const { error } = await supabase
          .from('maintenance_work_orders')
          .insert({
            title: data.title,
            description: data.description,
            priority: data.priority,
            status: 'NEW',
            progress: 0
          });
          
        if (error) throw error;
        
        toast({
          title: 'Work Order Created',
          description: 'The new work order has been created successfully.',
          className: 'bg-[#0485ea]',
        });
      }
      
      // Close dialog and refresh work orders
      onClose();
      onWorkOrderSaved();
      
    } catch (error: any) {
      console.error('Error saving work order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save work order.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Work Order' : 'Create New Work Order'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <input
                id="title"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <span className="text-sm text-destructive">{errors.title.message?.toString()}</span>
              )}
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("description")}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="priority" className="text-sm font-medium">Priority</label>
              <select
                id="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("priority")}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderDialog;
