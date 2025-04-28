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
      total_amount: 0,
      items: [],
    },
  });

  useEffect(() => {
    if (changeOrder) {
      form.reset({
        ...changeOrder,
        entity_type: changeOrder.entity_type,
        entity_id: changeOrder.entity_id,
      });
    } else {
      form.reset({
        entity_type: entityType,
        entity_id: entityId || '',
        title: '',
        description: '',
        requested_by: '',
        requested_date: new Date().toISOString(),
        total_amount: 0,
        items: [],
      });
    }
  }, [changeOrder, entityType, entityId, form]);

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
    console.log('[ChangeOrderDialog] Starting submission with form data:', data);

    try {
      // 1. Prepare and Save Main Change Order Data
      const { items, ...coDataToSave } = data;
      const changeOrderPayload = {
        ...coDataToSave,
        entity_type: entityType,
        entity_id: entityId,
        id: isEditing ? changeOrder?.id : undefined,
        // Totals will be updated by trigger later
        total_amount: items?.reduce((sum, item) => sum + (item?.total_price || 0), 0) || 0,
        cost_impact:
          items?.reduce((sum, item) => sum + (item?.cost || 0) * (item?.quantity || 0), 0) || 0,
      };
      delete changeOrderPayload.items;
      delete changeOrderPayload.created_at;
      delete changeOrderPayload.updated_at;
      delete (changeOrderPayload as any).status;

      console.log('[ChangeOrderDialog] Upserting change_orders table with:', changeOrderPayload);
      const { data: savedCO, error: coError } = await supabase
        .from('change_orders')
        .upsert(changeOrderPayload)
        .select('id')
        .single();

      if (coError) throw coError;

      const savedCoId = savedCO.id;
      console.log('[ChangeOrderDialog] Main CO saved/updated. ID:', savedCoId);

      // 2. Process Change Order Items (Delete existing then Insert current)
      const currentItems = items || [];

      // Delete existing items if editing
      if (isEditing) {
        console.log(`[ChangeOrderDialog] Deleting existing items for CO ID: ${savedCoId}`);
        const { error: deleteError } = await supabase
          .from('change_order_items')
          .delete()
          .eq('change_order_id', savedCoId);
        // Log error but don't necessarily fail the whole operation
        if (deleteError)
          console.error('[ChangeOrderDialog] Error deleting existing items:', deleteError);
      }

      // Insert current items from form state
      if (currentItems.length > 0) {
        console.log(`[ChangeOrderDialog] Inserting ${currentItems.length} items...`);
        const itemInsertPromises = currentItems.map(item => {
          // Recalculate financials
          const cost = item.cost || 0;
          const quantity = item.quantity || 0;
          const markup_percentage = item.markup_percentage || 0;
          const markup_amount = cost * (markup_percentage / 100);
          const unit_price = cost + markup_amount; // Selling Price per unit
          const total_price = quantity * unit_price; // Total Selling Price
          const total_cost = quantity * cost;
          const gross_margin = total_price - total_cost;
          const gross_margin_percentage = total_price > 0 ? (gross_margin / total_price) * 100 : 0;

          const itemPayload = {
            ...item, // Spread first to potentially include fields not explicitly listed
            change_order_id: savedCoId, // Link to parent CO
            // Overwrite calculated values
            unit_price: parseFloat(unit_price.toFixed(2)),
            total_price: parseFloat(total_price.toFixed(2)),
            markup_amount: parseFloat(markup_amount.toFixed(2)),
            gross_margin: parseFloat(gross_margin.toFixed(2)),
            gross_margin_percentage: parseFloat(gross_margin_percentage.toFixed(2)),
            // Ensure required/defaulted values are correct
            cost: cost,
            quantity: quantity,
          };
          // Remove fields that shouldn't be inserted/updated
          delete (itemPayload as any).id; // Let DB generate ID
          delete (itemPayload as any).created_at;
          delete (itemPayload as any).updated_at;

          return supabase.from('change_order_items').insert(itemPayload);
        });

        const itemResults = await Promise.all(itemInsertPromises);
        const itemErrors = itemResults.map(res => res.error).filter(Boolean);

        if (itemErrors.length > 0) {
          console.error('[ChangeOrderDialog] Errors inserting items:', itemErrors);
          throw new Error(`Failed to save ${itemErrors.length} item(s).`);
        }
        console.log('[ChangeOrderDialog] Items processed successfully.');
      } else {
        console.log('[ChangeOrderDialog] No items to insert.');
      }

      // 3. Toast & Callbacks (Success)
      toast({
        title: isEditing ? 'Change Order Updated' : 'Change Order Created',
        description: `${changeOrderPayload.title} and its items have been saved.`,
      });
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

  const handleTabChange = (value: string) => {
    console.log('[ChangeOrderDialog] Tab changed to:', value);
    console.log('[ChangeOrderDialog] Current form values:', form.getValues());
    console.log('[ChangeOrderDialog] Form state errors:', form.formState.errors);
    setActiveTab(value);
  };

  console.log('[ChangeOrderDialog] Tab Disabled States (Pre-Render):', {
    financial: !isEditing && !form.getValues().items?.length,
    approval: !isEditing,
  });

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] max-h-[90vh] overflow-auto">
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
