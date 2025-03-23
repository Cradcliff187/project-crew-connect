
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

const workOrderFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.string().default("MEDIUM"),
  status: z.string().default("NEW"),
  po_number: z.string().optional(),
  work_order_number: z.string().optional(),
});

type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;

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
  const isMobile = useIsMobile();
  
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: isEditing ? {
      title: workOrder.title || '',
      description: workOrder.description || '',
      priority: workOrder.priority || 'MEDIUM',
      status: workOrder.status || 'NEW',
      po_number: workOrder.po_number || '',
      work_order_number: workOrder.work_order_number || '',
    } : {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'NEW',
      po_number: '',
      work_order_number: '',
    },
  });

  // Reset form when dialog opens/closes or when workOrder changes
  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        form.reset({
          title: workOrder.title || '',
          description: workOrder.description || '',
          priority: workOrder.priority || 'MEDIUM', 
          status: workOrder.status || 'NEW',
          po_number: workOrder.po_number || '',
          work_order_number: workOrder.work_order_number || '',
        });
      } else {
        form.reset({
          title: '',
          description: '',
          priority: 'MEDIUM',
          status: 'NEW',
          po_number: '',
          work_order_number: '',
        });
      }
    }
  }, [isOpen, workOrder, form, isEditing]);

  const onSubmit = async (data: WorkOrderFormValues) => {
    try {
      setLoading(true);
      
      if (isEditing && workOrder) {
        // Update existing work order
        const { error } = await supabase
          .from('maintenance_work_orders')
          .update({
            title: data.title,
            description: data.description,
            priority: data.priority,
            status: data.status,
            po_number: data.po_number,
            work_order_number: data.work_order_number,
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
            status: data.status,
            po_number: data.po_number,
            work_order_number: data.work_order_number,
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
      <DialogContent 
        className={isMobile 
          ? "max-w-[95vw] p-0 max-h-[90vh] flex flex-col overflow-hidden" 
          : "sm:max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden"
        }
      >
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-xl font-semibold text-[#0485ea]">
            {isEditing ? 'Edit Work Order' : 'Create New Work Order'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-auto p-4">
          <Form {...form}>
            <form id="work-order-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter work order title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="work_order_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Order #</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="WO number (optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="po_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="PO number (optional)" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe the work order"
                        className="min-h-[120px]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {isEditing && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NEW">New</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="ON_HOLD">On Hold</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              {/* Adding extra space at bottom to ensure content doesn't get hidden behind the footer */}
              <div className="h-4"></div>
            </form>
          </Form>
        </ScrollArea>
        
        <DialogFooter className="p-4 border-t mt-auto flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
            className="min-w-[80px]"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            form="work-order-form"
            disabled={loading} 
            className="bg-[#0485ea] hover:bg-[#0373d1] min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Work Order' : 'Create Work Order'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderDialog;
