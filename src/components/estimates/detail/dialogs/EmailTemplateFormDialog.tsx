
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, SaveIcon, InfoIcon } from 'lucide-react';

// Template variable helpers
const TEMPLATE_VARIABLES = [
  { key: 'clientName', description: 'Client/customer name' },
  { key: 'revisionNumber', description: 'Revision number' },
  { key: 'estimateId', description: 'Estimate ID' }
];

interface EmailTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
  onSuccess?: () => void;
}

const EmailTemplateFormDialog: React.FC<EmailTemplateFormDialogProps> = ({
  open,
  onOpenChange,
  templateId,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && templateId) {
      loadTemplateData(templateId);
    } else if (open) {
      // Reset form for new template
      setTemplateName('');
      setSubject('Your Estimate from AKC LLC');
      setBody('Dear {{clientName}},\n\nThank you for the opportunity to provide this estimate for your project. Please find attached Revision {{revisionNumber}} of your estimate.\n\nPlease review the details and let us know if you have any questions or would like to proceed.\n\nBest regards,\nAKC LLC Team');
      setIsDefault(false);
      setIsLoading(false);
    }
  }, [open, templateId]);

  const loadTemplateData = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_email_settings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setTemplateName(data.template_name);
        setSubject(data.subject_template);
        setBody(data.body_template);
        setIsDefault(data.is_default || false);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email template data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!templateName || !subject || !body) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isDefault) {
        // If this will be the default, reset any existing defaults
        await supabase
          .from('estimate_email_settings')
          .update({ is_default: false })
          .eq('is_default', true);
      }

      // Insert or update the template
      const templateData = {
        template_name: templateName,
        subject_template: subject,
        body_template: body,
        is_default: isDefault
      };
      
      let response;
      
      if (templateId) {
        response = await supabase
          .from('estimate_email_settings')
          .update(templateData)
          .eq('id', templateId);
      } else {
        response = await supabase
          .from('estimate_email_settings')
          .insert(templateData);
      }
      
      if (response.error) throw response.error;
      
      toast({
        title: 'Success',
        description: `Email template ${templateId ? 'updated' : 'created'} successfully`,
        className: 'bg-[#0485ea] text-white'
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertVariable = (variable: string) => {
    const newValue = `${body}{{${variable}}}`;
    setBody(newValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {templateId ? 'Edit Email Template' : 'Create Email Template'}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Standard Estimate Email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Your Estimate from AKC LLC"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="body">Email Body</Label>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <InfoIcon className="h-3.5 w-3.5" />
                  <span>Use variables below to personalize</span>
                </div>
              </div>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter email body content..."
                required
                className="min-h-[200px]"
              />
            </div>
            
            <div className="border bg-gray-50 rounded-md p-3">
              <div className="text-sm font-medium mb-2">Available Template Variables:</div>
              <div className="flex flex-wrap gap-2">
                {TEMPLATE_VARIABLES.map((variable) => (
                  <Button 
                    key={variable.key}
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => insertVariable(variable.key)}
                    className="text-xs"
                  >
                    {`{{${variable.key}}}`}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Click on a variable to insert it at the current cursor position in the email body.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(!!checked)}
              />
              <Label 
                htmlFor="isDefault"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Set as default template
              </Label>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !templateName || !subject || !body}
            className="bg-[#0485ea] hover:bg-[#0373ce]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTemplateFormDialog;
