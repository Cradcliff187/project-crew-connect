
import { useEffect } from 'react';
import { SaveIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import WorkOrderBasicInfoFields from './WorkOrderBasicInfoFields';
import WorkOrderScheduleFields from './WorkOrderScheduleFields';
import WorkOrderLocationFields from './WorkOrderLocationFields';
import useWorkOrderForm from './useWorkOrderForm';

interface WorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkOrderAdded: () => void;
}

const WorkOrderDialog = ({ 
  open, 
  onOpenChange, 
  onWorkOrderAdded 
}: WorkOrderDialogProps) => {
  const { 
    form, 
    isSubmitting, 
    formData, 
    useCustomAddress, 
    fetchData, 
    onSubmit 
  } = useWorkOrderForm({ onOpenChange, onWorkOrderAdded });

  // Fetch data when dialog opens
  useEffect(() => {
    if (open) {
      console.log('Dialog opened, fetching data...');
      fetchData();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create New Work Order</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-grow pr-1 -mr-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <WorkOrderBasicInfoFields form={form} />
              <WorkOrderScheduleFields form={form} />
              <WorkOrderLocationFields 
                form={form} 
                useCustomAddress={useCustomAddress}
                customers={formData.customers}
                locations={formData.locations}
                employees={formData.employees}
              />
              
              <DialogFooter className="mt-6 sm:justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="sm:mb-0"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#0485ea] text-white hover:bg-[#0373d1]"
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Work Order'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderDialog;
