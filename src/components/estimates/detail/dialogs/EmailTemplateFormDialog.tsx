
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface EmailTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string; // For editing existing template
  onSuccess?: () => void;
}

const EmailTemplateFormDialog: React.FC<EmailTemplateFormDialogProps> = ({
  open,
  onOpenChange,
  templateId,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [subjectTemplate, setSubjectTemplate] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const { toast } = useToast();
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (templateId) {
        // Edit mode - load existing template
        loadTemplate();
      } else {
        // Create mode - set defaults
        setTemplateName('');
        setSubjectTemplate('Estimate for {{clientName}}');
        setBodyTemplate('Dear {{clientName}},\n\nPlease find attached the estimate for your project.\n\nPlease review and let me know if you have any questions.\n\nThank you,\nAKC LLC');
        setIsDefault(false);
        setIsLoading(false);
      }
    }
  }, [open, templateId]);
  
  const loadTemplate = async () => {
    if (!templateId) return;
    
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
      console.error('Error loading template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email template',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!templateName || !subjectTemplate || !bodyTemplate) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    try {
      if (isDefault) {
        // If this template is being set as default, unset any other defaults
        await supabase
          .from('estimate_email_settings')
          .update({ is_default: false })
          .not('id', 'eq', templateId || '00000000-0000-0000-0000-000000000000');
      }
      
      const templateData = {
        template_name: templateName,
        subject_template: subjectTemplate,
        body_template: bodyTemplate,
        is_default: isDefault
      };
      
      let result;
      
      if (templateId) {
        // Update existing template
        result = await supabase
          .from('estimate_email_settings')
          .update(templateData)
          .eq('id', templateId);
      } else {
        // Create new template
        result = await supabase
          .from('estimate_email_settings')
          .insert([templateData]);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: templateId ? 'Template updated' : 'Template created',
        description: `Email template "${templateName}" has been ${templateId ? 'updated' : 'created'}`,
        className: 'bg-[#0485ea] text-white',
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save email template',
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
            {templateId ? 'Edit Email Template' : 'Create Email Template'}
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
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  placeholder="e.g., Standard Estimate Email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subjectTemplate">Email Subject</Label>
                <Input
                  id="subjectTemplate"
                  value={subjectTemplate}
                  onChange={e => setSubjectTemplate(e.target.value)}
                  placeholder="e.g., Estimate for {{clientName}}"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bodyTemplate">Email Body</Label>
                <Textarea
                  id="bodyTemplate"
                  value={bodyTemplate}
                  onChange={e => setBodyTemplate(e.target.value)}
                  placeholder="Enter email body content here..."
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="isDefault" 
                  checked={isDefault} 
                  onCheckedChange={(checked) => setIsDefault(!!checked)} 
                />
                <Label htmlFor="isDefault" className="text-sm font-medium leading-none">
                  Set as default template
                </Label>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700">Template Variables</AlertTitle>
                <AlertDescription className="text-blue-600 text-sm">
                  You can use the following variables in your templates:
                  <ul className="list-disc pl-5 pt-2 space-y-1">
                    <li>{'{{clientName}}'} - Client's name</li>
                    <li>{'{{estimateId}}'} - Estimate ID</li>
                    <li>{'{{revisionNumber}}'} - Revision version number</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving || isLoading}
            className="bg-[#0485ea] hover:bg-[#0373ce]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              templateId ? 'Update Template' : 'Create Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTemplateFormDialog;
