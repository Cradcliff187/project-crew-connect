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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Eye, PlusCircle, Settings } from 'lucide-react';
import { EstimateRevision } from '@/components/estimates/types/estimateTypes';
import EstimatePrintTemplate from '../EstimatePrintTemplate';
import useRevisionPdf from '../../hooks/useRevisionPdf';
import RevisionPDFViewer from '../RevisionPDFViewer';
import EmailTemplateSelector, { EmailTemplate } from '../EmailTemplateSelector';
import EmailTemplatePreviewCard from '../EmailTemplatePreviewCard';
import EmailTemplateFormDialog from './EmailTemplateFormDialog';

interface SendRevisionEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  revision: EstimateRevision;
  clientName?: string;
  clientEmail?: string;
  onSuccess?: () => void;
}

const SendRevisionEmailDialog: React.FC<SendRevisionEmailDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  revision,
  clientName = "Client",
  clientEmail = "",
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<string>("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toEmail, setToEmail] = useState(clientEmail);
  const [ccEmail, setCcEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachPdf, setAttachPdf] = useState(true);
  const [estimate, setEstimate] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { generateRevisionPdf, checkRevisionPdf, isGenerating } = useRevisionPdf({
    onSuccess: (documentId) => {
      console.log('PDF generated with document ID:', documentId);
      if (onSuccess) {
        onSuccess();
      }
    }
  });

  useEffect(() => {
    if (open) {
      setActiveTab("email");
      setToEmail(clientEmail);
      setCcEmail('');
      fetchEstimateData();
      setEmailSent(false);
    }
  }, [open, clientEmail]);

  const fetchEstimateData = async () => {
    setIsLoading(true);
    try {
      const { data: estimateData, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimateid', estimateId)
        .single();
      
      if (estimateError) throw estimateError;
      setEstimate(estimateData);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', revision.id)
        .order('id');
      
      if (itemsError) throw itemsError;
      setItems(itemsData || []);
      
      const pdfDocumentId = await checkRevisionPdf(revision.id);
      if (!pdfDocumentId) {
        setAttachPdf(true);
      }
    } catch (error) {
      console.error('Error fetching estimate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject_template);
    setMessage(template.body_template);
  };

  const handleGeneratePdf = async () => {
    if (!pdfContentRef.current) return;
    
    try {
      const documentId = await generateRevisionPdf(
        pdfContentRef.current,
        estimateId,
        revision.id,
        revision.version,
        clientName
      );
      
      if (documentId && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error generating PDF",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    if (!toEmail) {
      toast({
        title: "Missing recipient",
        description: "Please enter a recipient email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let pdfDocumentId = revision.pdf_document_id;
      
      if (attachPdf && !pdfDocumentId && pdfContentRef.current) {
        pdfDocumentId = await generateRevisionPdf(
          pdfContentRef.current,
          estimateId,
          revision.id,
          revision.version,
          clientName
        );
      }
      
      const { error: communicationError } = await supabase
        .from('contact_interactions')
        .insert({
          contact_id: estimate.customerid,
          interaction_type: 'EMAIL',
          subject: `Estimate ${estimateId} Revision ${revision.version}`,
          notes: message,
          status: 'COMPLETED'
        });
        
      if (communicationError) {
        console.error("Error recording communication:", communicationError);
      }
      
      const { error: updateError } = await supabase
        .from('estimate_revisions')
        .update({
          status: 'sent',
          sent_date: new Date().toISOString(),
          sent_to: toEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', revision.id);
        
      if (updateError) throw updateError;
      
      const { error: estimateError } = await supabase
        .from('estimates')
        .update({
          status: 'sent',
          sentdate: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('estimateid', estimateId);
        
      if (estimateError) throw estimateError;
      
      setEmailSent(true);
      
      toast({
        title: "Email Sent Successfully",
        description: `Revision ${revision.version} has been sent to ${toEmail}`,
        className: "bg-[#0485ea] text-white",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Error Sending Email",
        description: error.message || "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateFormSuccess = () => {
    setTemplateFormOpen(false);
    // Refresh templates
    fetchEstimateData();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Send Estimate Revision</DialogTitle>
          <DialogDescription>
            Send Revision {revision.version} of Estimate #{estimateId} to the client
          </DialogDescription>
        </DialogHeader>

        {emailSent ? (
          <div className="py-12 text-center">
            <div className="bg-[#0485ea]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-10 w-10 text-[#0485ea]" />
            </div>
            <h3 className="text-xl font-medium mb-2">Email Sent Successfully!</h3>
            <p className="text-muted-foreground">
              Revision {revision.version} has been sent to {toEmail}
            </p>
            <Button 
              className="mt-6"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="mb-4 grid grid-cols-2">
              <TabsTrigger value="email">Email Details</TabsTrigger>
              <TabsTrigger value="preview">PDF Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <EmailTemplateSelector
                      onTemplateSelect={handleTemplateSelect}
                      onCreateClick={() => setTemplateFormOpen(true)}
                      revision={revision}
                      clientName={clientName}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="toEmail">To</Label>
                      <Input
                        id="toEmail"
                        value={toEmail}
                        onChange={e => setToEmail(e.target.value)}
                        placeholder="client@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ccEmail">Cc (Optional)</Label>
                      <Input
                        id="ccEmail"
                        value={ccEmail}
                        onChange={e => setCcEmail(e.target.value)}
                        placeholder="colleague@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Estimate Revision"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Enter your message here"
                        className="min-h-[150px]"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="attachPdf"
                        checked={attachPdf}
                        onCheckedChange={(checked) => setAttachPdf(!!checked)}
                      />
                      <Label htmlFor="attachPdf">
                        {revision.pdf_document_id 
                          ? "Attach PDF to email" 
                          : "Generate and attach PDF to email"}
                      </Label>
                    </div>
                    
                    {subject && message && (
                      <div className="pt-4 border-t mt-6">
                        <EmailTemplatePreviewCard
                          subject={subject}
                          body={message}
                          recipientEmail={toEmail}
                        />
                      </div>
                    )}
                    
                    {revision.pdf_document_id && (
                      <div className="mt-2 border-t pt-4">
                        <div className="text-sm font-medium mb-2">Revision PDF</div>
                        <RevisionPDFViewer revision={revision} showCard={false} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-md">
              {!revision.pdf_document_id && !isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="text-center max-w-md">
                    <h3 className="text-lg font-medium mb-2">No PDF Generated Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a PDF preview of this revision to see how it will look when attached to the email.
                    </p>
                    <Button 
                      onClick={handleGeneratePdf} 
                      className="bg-[#0485ea] hover:bg-[#0373ce]"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Generate PDF Preview
                    </Button>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Generating PDF preview...</p>
                  </div>
                </div>
              ) : revision.pdf_document_id ? (
                <div className="flex flex-col h-full">
                  <div className="bg-white p-4 rounded-md shadow-sm mb-4">
                    <h3 className="text-sm font-medium flex items-center gap-1.5 mb-3">
                      <Eye className="h-4 w-4" />
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
              ) : null}
            </TabsContent>
          </Tabs>
        )}

        {!emailSent && (
          <DialogFooter className="pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSubmitting || isLoading || !toEmail}
              className="bg-[#0485ea] hover:bg-[#0373ce]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        )}
        
        {estimate && items && (
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
        
        <EmailTemplateFormDialog
          open={templateFormOpen}
          onOpenChange={setTemplateFormOpen}
          onSuccess={handleTemplateFormSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SendRevisionEmailDialog;
