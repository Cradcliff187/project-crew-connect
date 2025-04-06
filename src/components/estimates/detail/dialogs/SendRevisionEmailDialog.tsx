
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
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [pdfDocumentId, setPdfDocumentId] = useState<string | null>(null);
  const { generatePdf, checkRevisionPdf, isGenerating } = usePdfGeneration();

  useEffect(() => {
    if (open) {
      setTo(clientEmail || '');
      loadEmailTemplates();
      checkExistingPdf();
    }
  }, [open, clientEmail, revision]);

  const loadEmailTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from('estimate_email_settings')
        .select('*')
        .order('is_default', { ascending: false });
        
      if (error) throw error;
      
      setTemplates(data || []);
      
      // If there's a default template, select it
      const defaultTemplate = data?.find(t => t.is_default);
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
        applyTemplate(defaultTemplate);
      }
    } catch (error) {
      console.error('Error loading email templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };
  
  const checkExistingPdf = async () => {
    if (!revision?.id) return;
    
    try {
      const documentId = await checkRevisionPdf(revision.id);
      setPdfDocumentId(documentId);
    } catch (error) {
      console.error('Error checking for existing PDF:', error);
    }
  };

  const applyTemplate = (template: EmailTemplate) => {
    // Replace variables in the template
    let processedSubject = template.subject_template;
    let processedBody = template.body_template;
    
    // Replace the variables with actual values
    const revisionNumber = revision?.version?.toString() || '1';
    
    processedSubject = processedSubject
      .replace(/{{clientName}}/g, clientName)
      .replace(/{{revisionNumber}}/g, revisionNumber)
      .replace(/{{estimateId}}/g, estimateId.substring(0, 10));
      
    processedBody = processedBody
      .replace(/{{clientName}}/g, clientName)
      .replace(/{{revisionNumber}}/g, revisionNumber)
      .replace(/{{estimateId}}/g, estimateId.substring(0, 10));
    
    setSubject(processedSubject);
    setEmailBody(processedBody);
  };

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const selected = templates.find(t => t.id === id);
    if (selected) {
      applyTemplate(selected);
    }
  };

  const handleSendEmail = async () => {
    if (!to) {
      toast({
        title: "Recipient Required",
        description: "Please enter at least one recipient email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    try {
      let pdfId = pdfDocumentId;
      
      // If we need to attach PDF but don't have one yet, generate it
      if (attachPdf && !pdfId && revision?.id) {
        pdfId = await generatePdf(estimateId, revision.id);
      }
      
      // Now send the email
      const { error } = await supabase.functions.invoke('send-estimate-email', {
        body: {
          to,
          cc: cc || undefined,
          bcc: bcc || undefined,
          subject,
          message: emailBody,
          estimateId,
          revisionId: revision?.id,
          pdfDocumentId: attachPdf ? pdfId : undefined
        }
      });
      
      if (error) throw error;
      
      // Log the email activity
      await supabase
        .from('activitylog')
        .insert({
          action: 'Email sent',
          moduletype: 'ESTIMATES',
          referenceid: estimateId,
          status: 'completed',
          detailsjson: JSON.stringify({ 
            to, 
            subject, 
            attachedPdf: attachPdf && !!pdfId 
          }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      toast({
        title: "Email Sent",
        description: "The estimate has been emailed successfully.",
        className: "bg-[#0485ea] text-white",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to Send Email",
        description: error.message || "There was an error sending the email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Estimate by Email</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!revision ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No revision selected. Please select a revision to send.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {isLoadingTemplates ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {templates.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="template">Email Template</Label>
                      <Select
                        value={selectedTemplateId}
                        onValueChange={handleTemplateChange}
                      >
                        <SelectTrigger id="template">
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem 
                              key={template.id} 
                              value={template.id}
                            >
                              {template.template_name} {template.is_default && "(Default)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="to">To</Label>
                    <Input
                      id="to"
                      type="email"
                      placeholder="recipient@example.com"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cc">CC</Label>
                      <Input
                        id="cc"
                        placeholder="cc@example.com"
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bcc">BCC</Label>
                      <Input
                        id="bcc"
                        placeholder="bcc@example.com"
                        value={bcc}
                        onChange={(e) => setBcc(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={8}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="attachPdf"
                      checked={attachPdf}
                      onCheckedChange={(checked) => setAttachPdf(!!checked)}
                    />
                    <Label 
                      htmlFor="attachPdf" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Attach PDF document
                    </Label>
                  </div>
                  
                  {attachPdf && !pdfDocumentId && (
                    <div className="text-sm flex items-center text-amber-500">
                      <Info className="h-4 w-4 mr-1" />
                      A PDF will be generated before sending
                    </div>
                  )}
                  
                  {attachPdf && pdfDocumentId && (
                    <div className="text-sm flex items-center text-green-600">
                      <Info className="h-4 w-4 mr-1" />
                      PDF document is ready to attach
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending || isGenerating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSendEmail}
            disabled={!to || isSending || isGenerating || !revision}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            {isSending || isGenerating ? (
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
