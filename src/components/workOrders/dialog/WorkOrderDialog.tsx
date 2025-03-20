
import { SaveIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import WorkOrderBasicInfoFields from './WorkOrderBasicInfoFields';
import WorkOrderScheduleFields from './WorkOrderScheduleFields';
import WorkOrderLocationFields from './WorkOrderLocationFields';
import useWorkOrderForm from './useWorkOrderForm';
import { Loader2 } from 'lucide-react';

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
    dataLoaded,
    isLoading,
    onSubmit
  } = useWorkOrderForm({ 
    onOpenChange, 
    onWorkOrderAdded,
    isOpen: open
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden bg-white">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-[#0485ea]">
            Create New Work Order
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-grow pr-1 -mr-1 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <Form {...form}>
              <form id="work-order-form" onSubmit={handleSubmit} className="space-y-6">
                <WorkOrderBasicInfoFields form={form} />
                <WorkOrderScheduleFields form={form} />
                
                {dataLoaded && (
                  <WorkOrderLocationFields 
                    form={form} 
                    useCustomAddress={useCustomAddress}
                    customers={formData.customers}
                    locations={formData.locations}
                    employees={formData.employees}
                  />
                )}
              </form>
            </Form>
          )}
        </div>
        
        <DialogFooter className="border-t pt-4 mt-auto">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="sm:mb-0"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            form="work-order-form"
            type="submit" 
            disabled={isSubmitting || isLoading || !dataLoaded}
            className="bg-[#0485ea] text-white hover:bg-[#0373d1]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Work Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderDialog;
