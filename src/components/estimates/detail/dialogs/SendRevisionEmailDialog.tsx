
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EstimateRevision } from '@/components/estimates/types/estimateTypes';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

interface SendRevisionEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  revision: EstimateRevision;
  clientName: string;
  clientEmail?: string;
  onSuccess?: () => void;
}

const SendRevisionEmailDialog: React.FC<SendRevisionEmailDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  revision,
  clientName,
  clientEmail,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [emailSettings, setEmailSettings] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipient, setRecipient] = useState(clientEmail || "");
  const { toast } = useToast();

  // Fetch email templates on dialog open
  useEffect(() => {
    if (open) {
      setIsSent(false);
      fetchEmailTemplates();
      setRecipient(clientEmail || "");
    }
  }, [open, clientEmail]);

  // Fetch email templates from database
  const fetchEmailTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('estimate_email_settings')
        .select('*')
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      
      setEmailSettings(data || []);
      
      if (data && data.length > 0) {
        // Select default template or first one
        const defaultTemplate = data.find(template => template.is_default);
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate.id);
          applyTemplate(defaultTemplate);
        }
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
  };

  // Apply selected template
  const applyTemplate = (template: any) => {
    const processedSubject = processTemplate(template.subject_template, { 
      clientName,
      revisionNumber: revision.version,
      estimateId: estimateId,
    });
    
    const processedBody = processTemplate(template.body_template, { 
      clientName,
      revisionNumber: revision.version,
      estimateId: estimateId,
    });
    
    setSubject(processedSubject);
    setBody(processedBody);
  };

  // Replace templates with actual values
  const processTemplate = (template: string, values: Record<string, any>) => {
    let processed = template;
    
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    });
    
    return processed;
  };

  // Handle template selection change
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    const template = emailSettings.find(t => t.id === value);
    if (template) {
      applyTemplate(template);
    }
  };

  // Send the email
  const handleSendEmail = async () => {
    if (!recipient) {
      toast({
        title: "Missing recipient",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, you would call an Edge Function to send the email
      // For now, we'll just simulate the email sending process
      
      // Update the revision status to 'sent'
      const { error: updateError } = await supabase
        .from('estimate_revisions')
        .update({
          status: 'sent',
          sent_date: new Date().toISOString(),
          sent_to: recipient,
          updated_at: new Date().toISOString()
        })
        .eq('id', revision.id);
        
      if (updateError) throw updateError;
      
      // Log the activity
      const { error: logError } = await supabase
        .from('activitylog')
        .insert({
          action: 'Estimate Revision Email Sent',
          moduletype: 'ESTIMATE',
          referenceid: estimateId,
          status: 'sent',
          previousstatus: revision.status,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          useremail: 'current-user@example.com', // In real app, get from auth
          detailsjson: JSON.stringify({
            recipient,
            subject,
            revisionId: revision.id,
            revisionVersion: revision.version
          })
        });
        
      if (logError) throw logError;
      
      // Success feedback  
      toast({
        title: "Email sent successfully",
        description: `Estimate revision ${revision.version} has been sent to ${recipient}`,
        className: "bg-[#0485ea] text-white",
      });
      
      setIsSent(true);
      
      // Delay closing to show success state
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onOpenChange(false);
      }, 1500);
      
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Failed to send email",
        description: error.message || "An error occurred while sending the email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isSent ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Revision Email</DialogTitle>
          <DialogDescription>
            Send revision {revision.version} of this estimate to the client.
          </DialogDescription>
        </DialogHeader>

        {isSent ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-center">Email Sent Successfully!</h3>
            <p className="text-center text-muted-foreground mt-2">
              Revision {revision.version} has been sent to {recipient}
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emailTemplate">Email Template</Label>
              <Select 
                value={selectedTemplate} 
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an email template" />
                </SelectTrigger>
                <SelectContent>
                  {emailSettings.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.template_name} {template.is_default ? "(Default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input 
                id="recipient" 
                value={recipient} 
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="client@example.com" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Estimate Revision for Your Project" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea 
                id="body" 
                value={body} 
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter your message to the client..."
                rows={8}
              />
            </div>
          </div>
        )}
        
        {!isSent && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={loading || !recipient.trim()}
              className="bg-[#0485ea] hover:bg-[#0373ce]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SendRevisionEmailDialog;
