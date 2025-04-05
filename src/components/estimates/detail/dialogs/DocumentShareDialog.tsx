
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useDocumentSharing } from '@/components/documents/hooks/useDocumentSharing';

interface DocumentShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: any;
  estimateId: string;
  clientEmail?: string;
}

const DocumentShareDialog: React.FC<DocumentShareDialogProps> = ({
  open,
  onOpenChange,
  document,
  estimateId,
  clientEmail
}) => {
  const [recipientEmail, setRecipientEmail] = useState<string>(clientEmail || '');
  const [subject, setSubject] = useState<string>('Document Shared: Estimate PDF');
  const [message, setMessage] = useState<string>(`Please find the attached PDF document for your estimate.\n\nThank you for your business.`);
  const [includeEntityLink, setIncludeEntityLink] = useState<boolean>(false);
  const { shareDocument, isSending } = useDocumentSharing();
  
  useEffect(() => {
    // Reset form when dialog opens
    if (open) {
      setRecipientEmail(clientEmail || '');
      setSubject('Document Shared: Estimate PDF');
      setMessage(`Please find the attached PDF document for your estimate.\n\nThank you for your business.`);
      setIncludeEntityLink(false);
    }
  }, [open, clientEmail]);
  
  const handleSendEmail = async () => {
    if (!document || !document.document_id) {
      toast({
        title: 'Missing Document',
        description: 'No document available to share.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!recipientEmail) {
      toast({
        title: 'Missing Recipient',
        description: 'Please enter a recipient email address.',
        variant: 'destructive',
      });
      return;
    }
    
    const success = await shareDocument({
      documentId: document.document_id,
      estimateId,
      recipientEmail,
      subject,
      message,
      includeEntityLink,
    });
    
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[530px]">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {document ? (
            <>
              <div className="bg-muted p-3 rounded-md mb-4">
                <h4 className="font-medium text-sm mb-1">Document Details</h4>
                <p className="text-sm">{document.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {document.file_type} • {(document.file_size / 1024).toFixed(1)} KB
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  disabled={isSending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  disabled={isSending}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Email message"
                  disabled={isSending}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeLink"
                  checked={includeEntityLink}
                  onCheckedChange={(checked) => setIncludeEntityLink(checked as boolean)}
                  disabled={isSending}
                />
                <Label htmlFor="includeLink">
                  Include a link to view online (if available)
                </Label>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Info className="h-3 w-3 mr-1" />
                The document will be shared as an email attachment
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No document is available to share. Please generate a PDF first.
            </div>
          )}
        </div>
          
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmail} 
            disabled={isSending || !document} 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Document'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentShareDialog;
