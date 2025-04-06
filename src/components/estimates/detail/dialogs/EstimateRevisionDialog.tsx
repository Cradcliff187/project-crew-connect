
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EstimateLineItemsEditor from '../editors/EstimateLineItemsEditor';

interface EstimateRevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  currentVersion: number;
  onSuccess?: () => void;
}

interface RevisionFormValues {
  notes: string;
  revisionItems: any[];
  contingencyPercentage: number;
}

const EstimateRevisionDialog: React.FC<EstimateRevisionDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  currentVersion,
  onSuccess
}) => {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [currentRevisionId, setCurrentRevisionId] = useState<string | null>(null);
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const { toast } = useToast();
  
  const form = useForm<RevisionFormValues>({
    defaultValues: {
      notes: '',
      revisionItems: [],
      contingencyPercentage: 0
    }
  });
  
  useEffect(() => {
    if (open && estimateId) {
      // Get current revision ID
      supabase
        .from('estimate_revisions')
        .select('id')
        .eq('estimate_id', estimateId)
        .eq('is_current', true)
        .single()
        .then(({ data: revData, error }) => {
          if (!error && revData) {
            setCurrentRevisionId(revData.id);
            
            // Get current items for this revision
            supabase
              .from('estimate_items')
              .select('*')
              .eq('estimate_id', estimateId)
              .eq('revision_id', revData.id)
              .then(({ data: itemsData, error: itemsError }) => {
                if (!itemsError && itemsData) {
                  setCurrentItems(itemsData);
                  form.reset({
                    notes: '',
                    revisionItems: itemsData,
                    contingencyPercentage: 0
                  });
                }
              });
          }
        });
      
      // Get contingency percentage from estimate
      supabase
        .from('estimates')
        .select('contingency_percentage')
        .eq('estimateid', estimateId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            form.setValue('contingencyPercentage', data.contingency_percentage || 0);
          }
        });
    }
  }, [open, estimateId, form]);

  const handleSubmit = async (values: RevisionFormValues) => {
    if (!estimateId) return;
    
    try {
      setSaving(true);
      
      // 1. Create new revision record
      const newVersion = currentVersion + 1;
      const { data: revisionData, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: estimateId,
          version: newVersion,
          revision_date: new Date().toISOString(),
          is_current: true,
          notes: values.notes,
          status: 'draft',
        })
        .select()
        .single();
      
      if (revisionError) throw revisionError;
      
      // 2. Update the previous revision to not be current
      if (currentRevisionId) {
        await supabase
          .from('estimate_revisions')
          .update({ is_current: false })
          .eq('id', currentRevisionId);
      }
      
      // 3. Insert new items linked to this revision
      const items = values.revisionItems.map(item => ({
        ...item,
        id: undefined, // Remove ID to create new records
        estimate_id: estimateId,
        revision_id: revisionData.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        original_item_id: item.id // Keep reference to original item
      }));
      
      const { error: itemsError } = await supabase
        .from('estimate_items')
        .insert(items);
      
      if (itemsError) throw itemsError;
      
      // 4. Update estimate with new total and contingency
      const totalAmount = values.revisionItems.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
      const contingencyAmount = totalAmount * (values.contingencyPercentage / 100);
      
      await supabase
        .from('estimates')
        .update({
          estimateamount: totalAmount,
          contingencyamount: contingencyAmount,
          contingency_percentage: values.contingencyPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('estimateid', estimateId);
      
      toast({
        title: 'Success',
        description: `Created revision ${newVersion}`,
      });
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating revision:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create revision',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Revision</DialogTitle>
          <DialogDescription>
            Create a new revision of this estimate. The current version is {currentVersion}.
          </DialogDescription>
        </DialogHeader>
        
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="items">Line Items</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div>
                  <Label htmlFor="notes">Revision Notes</Label>
                  <Textarea 
                    id="notes"
                    placeholder="Enter notes about the changes in this revision..." 
                    {...form.register('notes')}
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="contingencyPercentage">Contingency Percentage (%)</Label>
                  <Input 
                    id="contingencyPercentage"
                    type="number" 
                    step="0.1"
                    min="0" 
                    max="100"
                    {...form.register('contingencyPercentage', {
                      valueAsNumber: true,
                      min: 0,
                      max: 100
                    })}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="items">
                <EstimateLineItemsEditor 
                  form={form}
                  name="revisionItems"
                  estimateId={estimateId}
                />
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Revision
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateRevisionDialog;
