
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Send, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Document } from '@/components/documents/schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';

interface DocumentShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  estimateId: string;
  clientEmail?: string;
}

const DocumentShareDialog: React.FC<DocumentShareDialogProps> = ({
  open,
  onOpenChange,
  document,
  estimateId,
  clientEmail = ''
}) => {
  const [email, setEmail] = useState(clientEmail);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [includeEstimateLink, setIncludeEstimateLink] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open && document) {
      setEmail(clientEmail);
      setSubject(`Document from AKC LLC: ${document.file_name}`);
      setMessage(`Please find attached the document "${document.file_name}" related to your estimate. \n\nIf you have any questions, please don't hesitate to contact us.`);
    }
  }, [open, document, clientEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!document || !email) {
      toast({
        title: "Missing information",
        description: "Please provide an email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      // In a real implementation, this would call a serverless function to send an email
      // For demonstration, we'll log to the document_share_log table
      const { error } = await supabase
        .from('document_share_log')
        .insert({
          document_id: document.document_id,
          entity_id: estimateId,
          entity_type: 'ESTIMATE',
          recipient_email: email,
          subject: subject,
          message: message,
          include_estimate_link: includeEstimateLink,
        });
      
      if (error) throw error;
      
      toast({
        title: "Email notification sent",
        description: `Document has been shared with ${email}`,
        className: "bg-[#0485ea]",
      });
      
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error sending notification:', err);
      toast({
        title: "Failed to send notification",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-[#0485ea]" />
            Share Document
          </DialogTitle>
          <DialogDescription>
            Send this document by email to your client or team members.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Document from AKC LLC"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please find attached the document..."
              rows={4}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeEstimateLink" 
              checked={includeEstimateLink}
              onCheckedChange={(checked) => setIncludeEstimateLink(!!checked)}
            />
            <Label 
              htmlFor="includeEstimateLink"
              className="text-sm font-normal cursor-pointer"
            >
              Include link to view estimate
            </Label>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[#0485ea] hover:bg-[#0373ce]"
              disabled={isSending}
            >
              <Send className="h-4 w-4 mr-1" />
              {isSending ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentShareDialog;
