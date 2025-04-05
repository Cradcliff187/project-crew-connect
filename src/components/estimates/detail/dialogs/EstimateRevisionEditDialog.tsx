
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileDown, Eye } from 'lucide-react';
import useRevisionPdf from '../../hooks/useRevisionPdf';
import EstimatePrintTemplate from '../EstimatePrintTemplate';
import RevisionPDFViewer from '../RevisionPDFViewer';

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
  const [activeTab, setActiveTab] = useState<string>("edit");
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
  const { generateRevisionPdf, isGenerating, checkRevisionPdf } = useRevisionPdf({
    onSuccess: (documentId) => {
      console.log('PDF generated with document ID:', documentId);
      if (onSuccess) {
        onSuccess();
      }
    }
  });
  
  useEffect(() => {
    if (open && revisionId) {
      loadRevisionData();
      setActiveTab("edit");
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
      setGeneratePdf(!revisionData.pdf_document_id);
      
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

  const handleViewPreview = () => {
    if (revision.pdf_document_id) {
      setActiveTab("preview");
    } else if (pdfContentRef.current) {
      setGeneratePdf(true);
      setActiveTab("preview");
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="mb-4 grid grid-cols-2">
            <TabsTrigger value="edit">Edit Revision</TabsTrigger>
            <TabsTrigger value="preview" disabled={isLoading || (!revision?.pdf_document_id && !pdfContentRef.current)}>
              PDF Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="flex-1 overflow-y-auto">
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
                      {revision?.pdf_document_id 
                        ? "Replace existing PDF for this revision" 
                        : "Generate PDF for this revision"}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {revision?.pdf_document_id 
                        ? "This will replace the existing PDF for this revision." 
                        : "This will create a downloadable PDF version of this revision."}
                    </p>
                  </div>
                </div>

                {revision?.pdf_document_id && (
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Current Revision PDF</div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewPreview}
                        className="flex items-center gap-1.5"
                      >
                        <Eye className="h-4 w-4" />
                        View PDF
                      </Button>
                      
                      <RevisionPDFViewer revision={revision} showCard={false} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-md">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Generating PDF preview...</p>
                </div>
              </div>
            ) : revision?.pdf_document_id ? (
              <div className="flex flex-col h-full">
                <div className="bg-white p-4 rounded-md shadow-sm mb-4">
                  <h3 className="text-sm font-medium flex items-center gap-1.5 mb-3">
                    <FileDown className="h-4 w-4" />
                    PDF Preview
                  </h3>
                  <RevisionPDFViewer revision={revision} showCard={false} />
                </div>
                
                <div className="flex-1 bg-white p-4 rounded-md shadow-sm overflow-y-auto">
                  {estimate && items && (
                    <EstimatePrintTemplate 
                      estimate={estimate} 
                      items={items}
                      revision={revision}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-medium mb-2">No PDF Generated Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Save the revision with "Generate PDF" option checked to create a PDF.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
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
        {(generatePdf || activeTab === 'preview') && estimate && items && (
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
