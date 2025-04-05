
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
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EmailTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
  onSuccess?: () => void;
}

const EmailTemplateDialog: React.FC<EmailTemplateDialogProps> = ({
  open,
  onOpenChange,
  templateId,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [subjectTemplate, setSubjectTemplate] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && templateId) {
      // If editing existing template
      fetchTemplate();
    } else if (open) {
      // If creating new template
      resetForm();
    }
  }, [open, templateId]);

  const fetchTemplate = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_email_settings')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      if (data) {
        setTemplateName(data.template_name);
        setSubjectTemplate(data.subject_template);
        setBodyTemplate(data.body_template);
        setIsDefault(data.is_default);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast({
        title: "Error",
        description: "Failed to load email template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTemplateName('');
    setSubjectTemplate('Estimate Revision {{revisionNumber}} for Project #{{estimateId}}');
    setBodyTemplate(`Dear {{clientName}},

We have updated your estimate with revision {{revisionNumber}}.

Please review the attached estimate and let us know if you have any questions.

Thank you,
AKC LLC Team`);
    setIsDefault(false);
  };

  const handleSubmit = async () => {
    if (!templateName || !subjectTemplate || !bodyTemplate) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isDefault) {
        // If this template is set as default, remove default flag from other templates
        await supabase
          .from('estimate_email_settings')
          .update({ is_default: false })
          .neq('id', templateId || '0'); // If new template, use '0' as placeholder
      }

      if (templateId) {
        // Update existing template
        const { error } = await supabase
          .from('estimate_email_settings')
          .update({
            template_name: templateName,
            subject_template: subjectTemplate,
            body_template: bodyTemplate,
            is_default: isDefault,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId);

        if (error) throw error;

        toast({
          title: "Template updated",
          description: "Email template has been updated successfully",
          className: "bg-[#0485ea] text-white",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('estimate_email_settings')
          .insert({
            template_name: templateName,
            subject_template: subjectTemplate,
            body_template: bodyTemplate,
            is_default: isDefault,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        toast({
          title: "Template created",
          description: "New email template has been created",
          className: "bg-[#0485ea] text-white",
        });
      }

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{templateId ? 'Edit' : 'Create'} Email Template</DialogTitle>
          <DialogDescription>
            {templateId ?
              "Update this email template for estimate revisions" :
              "Create a new email template for sending estimate revisions"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="e.g., Standard Revision Notification"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjectTemplate">Email Subject</Label>
              <Input
                id="subjectTemplate"
                value={subjectTemplate}
                onChange={e => setSubjectTemplate(e.target.value)}
                placeholder="e.g., Your estimate has been updated"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyTemplate">Email Body</Label>
              <Textarea
                id="bodyTemplate"
                value={bodyTemplate}
                onChange={e => setBodyTemplate(e.target.value)}
                placeholder="Enter email body template..."
                className="min-h-[200px]"
              />
            </div>

            <div className="border-t pt-4 mt-6">
              <h4 className="text-sm font-medium mb-2">Available Variables</h4>
              <p className="text-sm text-muted-foreground mb-2">
                You can use these variables in your templates:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs bg-gray-100 p-2 rounded">
                  <code>{'{{clientName}}'}</code> - Client's name
                </div>
                <div className="text-xs bg-gray-100 p-2 rounded">
                  <code>{'{{revisionNumber}}'}</code> - Revision version number
                </div>
                <div className="text-xs bg-gray-100 p-2 rounded">
                  <code>{'{{estimateId}}'}</code> - Estimate ID
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Checkbox
                id="isDefault"
                checked={isDefault}
                onCheckedChange={(checked) => setIsDefault(!!checked)}
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as default template
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !templateName || !subjectTemplate || !bodyTemplate}
            className="bg-[#0485ea] hover:bg-[#0373ce]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTemplateDialog;
