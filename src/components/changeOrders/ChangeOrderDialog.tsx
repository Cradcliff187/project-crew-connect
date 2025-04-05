
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChangeOrder, ChangeOrderEntityType, ChangeOrderStatus } from '@/types/changeOrders';
import ChangeOrderBasicInfo from './ChangeOrderBasicInfo';
import ChangeOrderItems from './ChangeOrderItems';
import ChangeOrderApproval from './ChangeOrderApproval';
import FinancialAnalysisTab from './FinancialAnalysisTab';

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
  onSaved
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
      status: 'DRAFT' as ChangeOrderStatus,
      total_amount: 0,
      impact_days: 0,
      items: []
    }
  });

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
        items: []
      });
    }
  }, [changeOrder, entityType, entityId, form]);

  const handleSubmit = async (data: ChangeOrder) => {
    if (!entityId) {
      toast({
        title: "Error",
        description: "Missing required entity ID",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Prepare data for saving
      const changeOrderData = {
        ...data,
        entity_type: entityType,
        entity_id: entityId
      };

      let result;
      
      if (isEditing && changeOrder?.id) {
        // Update existing change order
        const { data: updatedChangeOrder, error } = await supabase
          .from('change_orders')
          .update(changeOrderData)
          .eq('id', changeOrder.id)
          .select()
          .single();
        
        if (error) throw error;
        result = updatedChangeOrder;
        
        toast({
          title: "Change order updated",
          description: "The change order has been updated successfully."
        });
      } else {
        // Create new change order
        const { data: newChangeOrder, error } = await supabase
          .from('change_orders')
          .insert(changeOrderData)
          .select()
          .single();
        
        if (error) throw error;
        result = newChangeOrder;
        
        toast({
          title: "Change order created",
          description: "The change order has been created successfully."
        });
      }
      
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving change order:', error);
      toast({
        title: "Error saving change order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-[#0485ea]">
            {isEditing ? 'Edit Change Order' : 'New Change Order'}
          </DialogTitle>
        </DialogHeader>
        
        <FormProvider {...form}>
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="basic-info">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="financial-analysis" disabled={!isEditing && !form.getValues().items?.length}>Financial Impact</TabsTrigger>
              <TabsTrigger value="approval" disabled={!isEditing}>Approval</TabsTrigger>
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
                  <FinancialAnalysisTab 
                    form={form} 
                    entityType={entityType}
                    entityId={entityId}
                  />
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
              
              <TabsContent value="approval" className="py-4">
                <ChangeOrderApproval 
                  form={form} 
                  changeOrderId={changeOrder?.id} 
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
            </form>
          </Tabs>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeOrderDialog;
