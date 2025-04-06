
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { EstimateRevision } from '../../types/estimateTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import usePdfGeneration from '../../hooks/usePdfGeneration';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SendRevisionEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revision: EstimateRevision | null;
  clientName?: string;
  clientEmail?: string;
  estimateId: string;
}

interface EmailTemplate {
  id: string;
  template_name: string;
  subject_template: string;
  body_template: string;
}

const SendRevisionEmailDialog: React.FC<SendRevisionEmailDialogProps> = ({
  open,
  onOpenChange,
  revision,
  clientName = 'Client',
  clientEmail,
  estimateId
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [to, setTo] = useState<string>(clientEmail || '');
  const [cc, setCc] = useState<string>('');
  const [bcc, setBcc] = useState<string>('');
  const [attachPdf, setAttachPdf] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPdf, setHasPdf] = useState(false);
  const { generatePdf, isGenerating, checkRevisionPdf } = usePdfGeneration();
  
  useEffect(() => {
    if (open && revision) {
      fetchTemplates();
      checkForExistingPdf();
    }
  }, [open, revision]);
  
  const checkForExistingPdf = async () => {
    if (revision?.id) {
      const pdfDocId = await checkRevisionPdf(revision.id);
      setHasPdf(!!pdfDocId);
    }
  };
  
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_email_settings')
        .select('*');
        
      if (error) throw error;
      
      setTemplates(data || []);
      
      // Set default template if available
      const defaultTemplate = data?.find(t => t.is_default);
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
        applyTemplate(defaultTemplate);
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyTemplate = (template: EmailTemplate) => {
    // Replace placeholders in subject
    let processedSubject = template.subject_template
      .replace(/\{client_name\}/g, clientName)
      .replace(/\{estimate_id\}/g, estimateId)
      .replace(/\{revision_number\}/g, revision?.version?.toString() || '');
      
    // Replace placeholders in body
    let processedBody = template.body_template
      .replace(/\{client_name\}/g, clientName)
      .replace(/\{estimate_id\}/g, estimateId)
      .replace(/\{revision_number\}/g, revision?.version?.toString() || '');
      
    setSubject(processedSubject);
    setEmailBody(processedBody);
  };
  
  const handleTemplateChange = (value: string) => {
    setSelectedTemplateId(value);
    const selectedTemplate = templates.find(t => t.id === value);
    if (selectedTemplate) {
      applyTemplate(selectedTemplate);
    }
  };
  
  const handleSendEmail = async () => {
    if (!to) {
      toast({
        title: 'Required Field Missing',
        description: 'Please enter a recipient email address.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    let pdfDocumentId = revision?.pdf_document_id;
    
    try {
      // Generate PDF if needed and requested
      if (attachPdf && !hasPdf && revision) {
        pdfDocumentId = await generatePdf(estimateId, revision.id);
        if (!pdfDocumentId) {
          toast({
            title: 'PDF Generation Failed',
            description: 'Could not generate PDF attachment for the email.',
            variant: 'destructive',
          });
        }
      }
      
      // Prepare email data
      const emailData = {
        to,
        cc,
        bcc,
        subject,
        body: emailBody,
        estimate_id: estimateId,
        revision_id: revision?.id,
        sent_by: 'system', // This would be the current user in a real system
        sent_at: new Date().toISOString(),
        pdf_document_id: attachPdf ? pdfDocumentId : null,
        status: 'SENT',
      };
      
      // In a real application, we would call an API endpoint to send the email
      // For now, we'll simulate it by logging to the activitylog table
      
      const { error } = await supabase
        .from('activitylog')
        .insert({
          action: 'EMAIL_SENT',
          moduletype: 'ESTIMATE',
          referenceid: estimateId,
          timestamp: new Date().toISOString(),
          status: 'SENT',
          detailsjson: JSON.stringify(emailData),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      // Update the revision status to 'sent' if it was in 'draft' or 'ready'
      if (revision && ['draft', 'ready'].includes(revision.status.toLowerCase())) {
        const { error: revisionError } = await supabase
          .from('estimate_revisions')
          .update({
            status: 'sent',
            sent_date: new Date().toISOString(),
            sent_to: to,
            pdf_document_id: pdfDocumentId,
            updated_at: new Date().toISOString()
          })
          .eq('id', revision.id);
          
        if (revisionError) {
          console.error('Error updating revision status:', revisionError);
        }
      }
      
      toast({
        title: 'Email Sent',
        description: 'The estimate has been sent successfully.',
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: 'Send Failed',
        description: error.message || 'There was an error sending the email.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Send Estimate</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
              <span className="ml-2">Loading templates...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {!clientEmail && (
                <Alert variant="warning" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No email address found for this client. Please enter a recipient email address manually.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="template">Email Template</Label>
                <Select 
                  value={selectedTemplateId} 
                  onValueChange={handleTemplateChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.template_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="recipient@example.com"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cc">CC</Label>
                  <Input
                    id="cc"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="cc@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bcc">BCC</Label>
                  <Input
                    id="bcc"
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="bcc@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Email subject"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  disabled={isSubmitting}
                  rows={10}
                  placeholder="Email body"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="attachPdf"
                  checked={attachPdf}
                  onCheckedChange={(checked) => setAttachPdf(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="attachPdf">
                  Attach PDF of the estimate
                </Label>
              </div>
              
              {!hasPdf && attachPdf && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Info className="h-3 w-3 mr-1" />
                  A PDF will be generated automatically when sending
                </div>
              )}
            </div>
          )}
        </div>
          
        <DialogFooter className="pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSubmitting || isGenerating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmail} 
            disabled={isSubmitting || isGenerating || isLoading} 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            {isSubmitting || isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isGenerating ? 'Generating PDF...' : 'Sending...'}
              </>
            ) : (
              'Send Email'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendRevisionEmailDialog;
