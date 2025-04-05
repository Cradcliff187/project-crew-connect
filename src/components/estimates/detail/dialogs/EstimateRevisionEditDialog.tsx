
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { EstimateItem, EstimateRevision } from '@/components/estimates/types/estimateTypes';
import EstimateLineItemsEditor from '../editors/EstimateLineItemsEditor';
import PDFExportButton from '../PDFExportButton';
import EstimatePrintTemplate from '../EstimatePrintTemplate';

interface EstimateRevisionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  revisionId: string;
  onSuccess?: () => void;
}

interface RevisionFormData {
  items: EstimateItem[];
}

const EstimateRevisionEditDialog: React.FC<EstimateRevisionEditDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  revisionId,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [estimate, setEstimate] = useState<any>(null);
  const [revision, setRevision] = useState<EstimateRevision | null>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const form = useForm<RevisionFormData>({
    defaultValues: {
      items: []
    }
  });
  
  // Fetch revision data
  useEffect(() => {
    const fetchRevisionData = async () => {
      if (!open || !revisionId) return;
      
      setIsLoading(true);
      try {
        // Fetch estimate data first
        const { data: estimateData, error: estimateError } = await supabase
          .from('estimates')
          .select('*')
          .eq('estimateid', estimateId)
          .single();
        
        if (estimateError) throw estimateError;
        setEstimate(estimateData);
        
        // Fetch revision data
        const { data: revisionData, error: revisionError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('id', revisionId)
          .single();
        
        if (revisionError) throw revisionError;
        setRevision(revisionData);
        
        // Fetch items for this revision
        const { data: items, error } = await supabase
          .from('estimate_items')
          .select('*')
          .eq('revision_id', revisionId)
          .order('id');
        
        if (error) throw error;
        
        form.reset({ items: items || [] });
      } catch (error) {
        console.error('Error fetching revision data:', error);
        toast({
          title: "Error loading revision",
          description: "Could not load revision data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRevisionData();
  }, [open, revisionId, form, estimateId]);
  
  const handleSubmit = async (data: RevisionFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // For each item, update or create as needed
      for (const item of data.items) {
        if (item.id && !item.id.toString().startsWith('new-')) {
          // Update existing item
          const { error } = await supabase
            .from('estimate_items')
            .update({
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.quantity * item.unit_price,
              cost: item.cost,
              markup_percentage: item.markup_percentage,
              markup_amount: item.markup_amount,
              notes: item.notes,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);
            
          if (error) throw error;
        } else {
          // Create new item
          const { error } = await supabase
            .from('estimate_items')
            .insert({
              estimate_id: estimateId,
              revision_id: revisionId,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.quantity * item.unit_price,
              cost: item.cost,
              markup_percentage: item.markup_percentage,
              markup_amount: item.markup_amount,
              notes: item.notes,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (error) throw error;
        }
      }
      
      // Update the revision to indicate it was modified
      const { error: revisionError } = await supabase
        .from('estimate_revisions')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', revisionId);
        
      if (revisionError) throw revisionError;
      
      toast({
        title: "Revision updated successfully",
        description: "Your changes to the estimate revision have been saved.",
        className: "bg-[#0485ea] text-white",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating revision:", error);
      toast({
        title: "Error updating revision",
        description: error.message || "Failed to update revision. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePdfGenerated = (documentId: string) => {
    // You can add additional handling here if needed
    console.log('PDF generated and saved with document ID:', documentId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Revision</DialogTitle>
          <DialogDescription>
            Make changes to this revision of the estimate. You can modify existing items or add new ones.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading revision data...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-1 py-4">
                <EstimateLineItemsEditor 
                  form={form} 
                  name="items"
                  estimateId={estimateId}
                />
              </div>
              
              <DialogFooter className="border-t pt-4 mt-4 flex flex-col sm:flex-row gap-2">
                <div className="flex flex-1 justify-start">
                  {estimate && revision && (
                    <PDFExportButton
                      estimateId={estimateId}
                      clientName={estimate.customername || "Client"}
                      projectName={estimate.projectname || "Project"}
                      date={estimate.datecreated || new Date().toISOString()}
                      contentRef={pdfContentRef}
                      revisionId={revision.id}
                      revisionNumber={revision.version}
                      autoUpload={true}
                      onPdfGenerated={handlePdfGenerated}
                      variant="outline"  // Changed from "secondary" to "outline" as per allowed variants
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#0485ea] hover:bg-[#0373ce]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        )}
        
        {/* Hidden print template for PDF generation */}
        {!isLoading && estimate && revision && (
          <div className="hidden">
            <div ref={pdfContentRef}>
              <EstimatePrintTemplate 
                estimate={estimate} 
                items={form.getValues().items}
                revision={revision}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EstimateRevisionEditDialog;
