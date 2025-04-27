import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChangeOrder, ChangeOrderEntityType, ChangeOrderStatus } from '@/types/changeOrders';
import ChangeOrderBasicInfo from './ChangeOrderBasicInfo';
import ChangeOrderItems from './ChangeOrderItems';
import ChangeOrderApproval from './ChangeOrderApproval';
import FinancialAnalysisTab from './FinancialAnalysisTab';
import ChangeOrderStatusControl from './ChangeOrderStatusControl';
import { StatusOption } from '@/components/common/status/UniversalStatusControl';

interface ChangeOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  workOrderId?: string;
  entityType: ChangeOrderEntityType;
  changeOrder?: ChangeOrder | null;
  onSaved: () => void;
}

const ChangeOrderDialog = ({
  isOpen,
  onClose,
  projectId,
  workOrderId,
  entityType = 'PROJECT',
  changeOrder,
  onSaved,
}: ChangeOrderDialogProps) => {
  const [activeTab, setActiveTab] = useState('basic-info');
  const [saving, setSaving] = useState(false);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const isEditing = !!changeOrder;
  const entityId = entityType === 'PROJECT' ? projectId : workOrderId;

  const form = useForm<ChangeOrder>({
    defaultValues: changeOrder || {
      entity_type: entityType,
      entity_id: entityId || '',
      title: '',
      description: '',
      requested_by: '',
      requested_date: new Date().toISOString(),
      status: 'DRAFT' as ChangeOrderStatus,
      total_amount: 0,
      impact_days: 0,
      items: [],
    },
  });

  const currentStatus = form.watch('status') as ChangeOrderStatus;

  useEffect(() => {
    if (changeOrder) {
      // Reset form with the changeOrder data
      form.reset(changeOrder);
    } else {
      // Reset form with default values
      form.reset({
        entity_type: entityType,
        entity_id: entityId || '',
        title: '',
        description: '',
        requested_by: '',
        requested_date: new Date().toISOString(),
        status: 'DRAFT' as ChangeOrderStatus,
        total_amount: 0,
        impact_days: 0,
        items: [],
      });
    }
  }, [changeOrder, entityType, entityId, form]);

  useEffect(() => {
    if (isEditing && isOpen) {
      fetchStatusDefinitions();
    }
  }, [isEditing, isOpen]);

  const fetchStatusDefinitions = async () => {
    setLoadingStatus(true);
    try {
      const { data: statusDefs, error: statusError } = await supabase
        .from('status_definitions')
        .select('*')
        .eq('entity_type', 'CHANGE_ORDER' as any);

      if (statusError) throw statusError;

      const mappedOptions = (statusDefs || []).map(def => ({
        value: def.status_code,
        label: def.label,
        color: def.color,
      }));
      setStatusOptions(mappedOptions);
    } catch (error: any) {
      console.error('Error fetching status definitions:', error);
      toast({
        title: 'Error',
        description: 'Could not load status options.',
        variant: 'destructive',
      });
      setStatusOptions([]);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleSubmit = async (data: ChangeOrder) => {
    if (!entityId) {
      toast({
        title: 'Error',
        description: 'Missing required entity ID',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Prepare data for saving, EXCLUDING the 'items' field
      const { items, ...dataToSave } = data; // Destructure to separate items

      const changeOrderData = {
        ...dataToSave, // Spread only the fields meant for the change_orders table
        entity_type: entityType,
        entity_id: entityId,
      };

      console.log('[ChangeOrderDialog] Saving data:', changeOrderData); // Log the actual data being sent

      let result;

      if (isEditing && changeOrder?.id) {
        // Update existing change order
        const { data: updatedChangeOrder, error } = await supabase
          .from('change_orders')
          .update(changeOrderData) // Pass the filtered data
          .eq('id', changeOrder.id)
          // Explicitly select only columns from change_orders table
          .select(
            'id, entity_type, entity_id, title, description, requested_by, requested_date, status, approved_by, approved_date, approval_notes, total_amount, cost_impact, revenue_impact, impact_days, original_completion_date, new_completion_date, change_order_number, document_id, created_at, updated_at'
          )
          .single();

        if (error) throw error;
        result = updatedChangeOrder;

        toast({
          title: 'Change order updated',
          description: 'The change order has been updated successfully.',
        });
      } else {
        // Create new change order
        const { data: newChangeOrder, error } = await supabase
          .from('change_orders')
          .insert(changeOrderData)
          // Explicitly select only columns from change_orders table
          .select(
            'id, entity_type, entity_id, title, description, requested_by, requested_date, status, approved_by, approved_date, approval_notes, total_amount, cost_impact, revenue_impact, impact_days, original_completion_date, new_completion_date, change_order_number, document_id, created_at, updated_at'
          )
          .single();

        if (error) throw error;
        result = newChangeOrder;

        toast({
          title: 'Change order created',
          description: 'The change order has been created successfully.',
        });
      }

      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving change order:', error);
      toast({
        title: 'Error saving change order',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Preserve form context when switching tabs
  const handleTabChange = (value: string) => {
    console.log('[ChangeOrderDialog] Tab changed to:', value);
    console.log('[ChangeOrderDialog] Current form values:', form.getValues());
    console.log('[ChangeOrderDialog] Form state errors:', form.formState.errors);
    // Check if the form is valid before allowing tab switch (optional, but good practice)
    // form.trigger(); // Optionally trigger validation on all fields
    // if (!form.formState.isValid) {
    //    console.log('[ChangeOrderDialog] Form invalid, preventing tab switch for now.');
    //    // Maybe show a toast? Preventing switch might be confusing.
    //    // return;
    // }
    setActiveTab(value);
  };

  // Log disabled states right before rendering
  console.log('[ChangeOrderDialog] Tab Disabled States (Pre-Render):', {
    financial: !isEditing && !form.getValues().items?.length,
    approval: !isEditing,
  });

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0485ea]">
            {isEditing ? 'Edit Change Order' : 'New Change Order'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of this change order'
              : 'Create a new change order for your project or work order'}
          </DialogDescription>
        </DialogHeader>

        {isEditing && changeOrder?.id && !loadingStatus && (
          <div className="my-4">
            <ChangeOrderStatusControl
              changeOrderId={changeOrder.id}
              currentStatus={currentStatus}
              statusOptions={statusOptions}
              onStatusChange={onSaved}
              className="justify-end"
            />
          </div>
        )}
        {isEditing && loadingStatus && (
          <div className="my-4 text-sm text-muted-foreground text-right">Loading status...</div>
        )}

        <FormProvider {...form}>
          <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="basic-info">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="financial-analysis">Financial Impact</TabsTrigger>
            </TabsList>

            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <TabsContent value="basic-info" className="py-4">
                <ChangeOrderBasicInfo form={form} isEditing={isEditing} />

                <div className="flex justify-end mt-6 space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#0485ea] hover:bg-[#0375d1]"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Change Order'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="items" className="py-4">
                <ChangeOrderItems
                  form={form}
                  changeOrderId={changeOrder?.id}
                  isEditing={isEditing}
                  onUpdated={onSaved}
                />

                <div className="flex justify-end mt-6 space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#0485ea] hover:bg-[#0375d1]"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Change Order'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="financial-analysis" className="py-4">
                {entityId && (
                  <FinancialAnalysisTab form={form} entityType={entityType} entityId={entityId} />
                )}

                <div className="flex justify-end mt-6 space-x-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#0485ea] hover:bg-[#0375d1]"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Change Order'}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Tabs>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeOrderDialog;
