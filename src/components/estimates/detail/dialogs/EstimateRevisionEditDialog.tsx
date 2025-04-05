
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileDown } from 'lucide-react';
import useRevisionPdf from '../../hooks/useRevisionPdf';
import EstimatePrintTemplate from '../EstimatePrintTemplate';

interface EstimateRevisionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  revisionId: string;
  onSuccess?: () => void;
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'ready', label: 'Ready To Send' },
  { value: 'sent', label: 'Sent' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const EstimateRevisionEditDialog: React.FC<EstimateRevisionEditDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  revisionId,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [revision, setRevision] = useState<any>(null);
  const [status, setStatus] = useState<string>('draft');
  const [notes, setNotes] = useState<string>('');
  const [generatePdf, setGeneratePdf] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [clientName, setClientName] = useState<string>('');
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { generateRevisionPdf, isGenerating } = useRevisionPdf({
    onSuccess: (documentId) => {
      console.log('PDF generated with document ID:', documentId);
    }
  });
  
  useEffect(() => {
    if (open && revisionId) {
      loadRevisionData();
    }
  }, [open, revisionId]);
  
  const loadRevisionData = async () => {
    setIsLoading(true);
    try {
      // Fetch revision
      const { data: revisionData, error: revisionError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('id', revisionId)
        .single();
      
      if (revisionError) throw revisionError;
      
      setRevision(revisionData);
      setStatus(revisionData.status || 'draft');
      setNotes(revisionData.notes || '');
      
      // Fetch estimate info
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*, customername')
        .eq('estimateid', estimateId)
        .single();
      
      if (estimateError) throw estimateError;
      setEstimate(estimateData);
      setClientName(estimateData.customername || 'Client');
      
      // Fetch revision items
      const { data: itemsData, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', revisionId)
        .order('id');
      
      if (itemsError) throw itemsError;
      setItems(itemsData || []);
      
    } catch (error) {
      console.error('Error loading revision data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revision data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveRevision = async () => {
    if (!revision) return;
    
    setIsSaving(true);
    try {
      // Update revision record
      const { error } = await supabase
        .from('estimate_revisions')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', revisionId);
      
      if (error) throw error;
      
      // If current revision is marked as sent, update the estimate status too
      if (status === 'sent') {
        const { error: estimateError } = await supabase
          .from('estimates')
          .update({
            status: 'sent',
            sentdate: new Date().toISOString(),
          })
          .eq('estimateid', estimateId);
        
        if (estimateError) throw estimateError;
      }
      
      // Generate PDF if requested
      if (generatePdf && pdfContentRef.current) {
        await generateRevisionPdf(
          pdfContentRef.current,
          estimateId,
          revisionId,
          revision.version,
          clientName
        );
      }
      
      toast({
        title: 'Revision Updated',
        description: 'The revision has been successfully updated',
        className: 'bg-[#0485ea] text-white',
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving revision:', error);
      toast({
        title: 'Error',
        description: 'Failed to save revision',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Edit Revision {revision?.version || ''}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes about this revision"
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="flex items-center gap-2 pt-4 border-t">
                <Checkbox 
                  id="generatePdf"
                  checked={generatePdf}
                  onCheckedChange={(checked) => setGeneratePdf(!!checked)}
                />
                <div>
                  <Label 
                    htmlFor="generatePdf"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Generate PDF for this revision
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {revision?.pdf_document_id 
                      ? "This will replace the existing PDF for this revision." 
                      : "This will create a downloadable PDF version of this revision."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving || isGenerating}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSaveRevision}
            disabled={isSaving || isGenerating || isLoading}
            className="bg-[#0485ea] hover:bg-[#0373ce]"
          >
            {isSaving || isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isGenerating ? 'Generating PDF...' : 'Saving...'}
              </>
            ) : (
              <>
                {generatePdf && <FileDown className="mr-2 h-4 w-4" />}
                Save Changes
              </>
            )}
          </Button>
        </div>
        
        {/* Hidden print template for PDF generation */}
        {generatePdf && estimate && items && (
          <div className="hidden">
            <div ref={pdfContentRef}>
              <EstimatePrintTemplate 
                estimate={estimate} 
                items={items}
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
