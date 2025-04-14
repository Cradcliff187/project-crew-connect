import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmailTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EmailTemplate {
  id: string;
  template_name: string;
  subject_template: string;
  body_template: string;
  is_default: boolean;
}

interface EmailConfig {
  id: string;
  from_name: string;
  from_email: string;
  reply_to: string;
  bcc_email: string;
  auto_bcc: boolean;
  signature: string;
}

const EmailTemplateDialog: React.FC<EmailTemplateDialogProps> = ({ open, onOpenChange }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');

  // Template editing state
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [subjectTemplate, setSubjectTemplate] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Config editing state
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [bccEmail, setBccEmail] = useState('');
  const [autoBcc, setAutoBcc] = useState(false);
  const [signature, setSignature] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplatesAndConfig();
    }
  }, [open]);

  const fetchTemplatesAndConfig = async () => {
    setIsLoading(true);
    try {
      // Fetch templates
      const { data: templateData, error: templateError } = await supabase
        .from('estimate_email_settings')
        .select('*');

      if (templateError) throw templateError;
      setTemplates(templateData || []);

      // Fetch email config
      const { data: configData, error: configError } = await supabase
        .from('estimate_email_config')
        .select('*')
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      if (configData) {
        setEmailConfig(configData);
        setFromName(configData.from_name);
        setFromEmail(configData.from_email);
        setReplyTo(configData.reply_to || '');
        setBccEmail(configData.bcc_email || '');
        setAutoBcc(configData.auto_bcc || false);
        setSignature(configData.signature || '');
      }
    } catch (error) {
      console.error('Error fetching email templates and config:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.template_name);
    setSubjectTemplate(template.subject_template);
    setBodyTemplate(template.body_template);
    setIsDefault(template.is_default || false);
  };

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setSubjectTemplate('Your Estimate #{estimate_id} is ready for review');
    setBodyTemplate(
      'Dear {client_name},\n\nThank you for your interest. Your estimate #{estimate_id} revision {revision_number} is ready for your review.\n\nPlease let us know if you have any questions.\n\nBest regards,\nAKC LLC Team'
    );
    setIsDefault(false);
  };

  const handleSaveTemplate = async () => {
    if (!templateName || !subjectTemplate || !bodyTemplate) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill in all the required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingTemplate(true);
    try {
      // If setting as default, unset any existing default
      if (isDefault) {
        const { error: unsetError } = await supabase
          .from('estimate_email_settings')
          .update({ is_default: false })
          .eq('is_default', true);

        if (unsetError) {
          console.error('Error unsetting default template:', unsetError);
        }
      }

      const templateData = {
        template_name: templateName,
        subject_template: subjectTemplate,
        body_template: bodyTemplate,
        is_default: isDefault,
      };

      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('estimate_email_settings')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;

        toast({
          title: 'Template Updated',
          description: 'Email template has been updated successfully.',
        });
      } else {
        // Create new template
        const { error } = await supabase.from('estimate_email_settings').insert(templateData);

        if (error) throw error;

        toast({
          title: 'Template Created',
          description: 'New email template has been created successfully.',
        });
      }

      // Refresh templates
      fetchTemplatesAndConfig();

      // Reset form
      setEditingTemplate(null);
      setTemplateName('');
      setSubjectTemplate('');
      setBodyTemplate('');
      setIsDefault(false);
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'There was an error saving the template.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('estimate_email_settings')
          .delete()
          .eq('id', templateId);

        if (error) throw error;

        toast({
          title: 'Template Deleted',
          description: 'Email template has been deleted successfully.',
        });

        fetchTemplatesAndConfig();
      } catch (error: any) {
        console.error('Error deleting template:', error);
        toast({
          title: 'Delete Failed',
          description: error.message || 'There was an error deleting the template.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSaveConfig = async () => {
    if (!fromName || !fromEmail) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill in all the required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingConfig(true);
    try {
      const configData = {
        from_name: fromName,
        from_email: fromEmail,
        reply_to: replyTo,
        bcc_email: bccEmail,
        auto_bcc: autoBcc,
        signature: signature,
      };

      if (emailConfig) {
        // Update existing config
        const { error } = await supabase
          .from('estimate_email_config')
          .update(configData)
          .eq('id', emailConfig.id);

        if (error) throw error;
      } else {
        // Create new config
        const { error } = await supabase.from('estimate_email_config').insert(configData);

        if (error) throw error;
      }

      toast({
        title: 'Settings Saved',
        description: 'Email settings have been saved successfully.',
      });

      // Refresh config
      fetchTemplatesAndConfig();
    } catch (error: any) {
      console.error('Error saving email config:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'There was an error saving the settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingConfig(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Email Settings</DialogTitle>
          <DialogDescription>
            Manage email templates and configuration for estimate communications.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="settings">Email Configuration</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <TabsContent value="templates" className="mt-0 h-full">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
                  <span className="ml-2">Loading templates...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {editingTemplate || templateName ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {editingTemplate ? 'Edit Template' : 'Create Template'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="templateName">Template Name</Label>
                          <Input
                            id="templateName"
                            value={templateName}
                            onChange={e => setTemplateName(e.target.value)}
                            disabled={isSavingTemplate}
                            placeholder="Invoice Reminder"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subjectTemplate">Email Subject Template</Label>
                          <Input
                            id="subjectTemplate"
                            value={subjectTemplate}
                            onChange={e => setSubjectTemplate(e.target.value)}
                            disabled={isSavingTemplate}
                            placeholder="Your invoice #{invoice_number} is ready"
                          />
                          <p className="text-xs text-muted-foreground">
                            Available variables: {'{client_name}'}, {'{estimate_id}'},{' '}
                            {'{revision_number}'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bodyTemplate">Email Body Template</Label>
                          <Textarea
                            id="bodyTemplate"
                            value={bodyTemplate}
                            onChange={e => setBodyTemplate(e.target.value)}
                            disabled={isSavingTemplate}
                            rows={8}
                          />
                          <p className="text-xs text-muted-foreground">
                            Available variables: {'{client_name}'}, {'{estimate_id}'},{' '}
                            {'{revision_number}'}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isDefault"
                            checked={isDefault}
                            onCheckedChange={checked => setIsDefault(checked as boolean)}
                            disabled={isSavingTemplate}
                          />
                          <Label htmlFor="isDefault">Set as default template</Label>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingTemplate(null);
                            setTemplateName('');
                            setSubjectTemplate('');
                            setBodyTemplate('');
                            setIsDefault(false);
                          }}
                          disabled={isSavingTemplate}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveTemplate}
                          disabled={isSavingTemplate}
                          className="bg-[#0485ea] hover:bg-[#0375d1]"
                        >
                          {isSavingTemplate ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Template'
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleNewTemplate}
                        className="bg-[#0485ea] hover:bg-[#0375d1]"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Template
                      </Button>
                    </div>
                  )}

                  {templates.length > 0 ? (
                    <div className="space-y-3">
                      {templates.map(template => (
                        <Card key={template.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>{template.template_name}</CardTitle>
                              {template.is_default && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div>
                              <p className="text-sm font-medium">Subject:</p>
                              <p className="text-sm">{template.subject_template}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Body:</p>
                              <p className="text-sm whitespace-pre-wrap">
                                {template.body_template}
                              </p>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No email templates found. Create your first template to get started.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
                  <span className="ml-2">Loading settings...</span>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Email Configuration</CardTitle>
                    <CardDescription>
                      Configure settings for sending estimate emails
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fromName">From Name</Label>
                        <Input
                          id="fromName"
                          value={fromName}
                          onChange={e => setFromName(e.target.value)}
                          disabled={isSavingConfig}
                          placeholder="AKC LLC Estimates"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fromEmail">From Email</Label>
                        <Input
                          id="fromEmail"
                          type="email"
                          value={fromEmail}
                          onChange={e => setFromEmail(e.target.value)}
                          disabled={isSavingConfig}
                          placeholder="estimates@akcllc.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="replyTo">Reply-To Email (Optional)</Label>
                      <Input
                        id="replyTo"
                        type="email"
                        value={replyTo}
                        onChange={e => setReplyTo(e.target.value)}
                        disabled={isSavingConfig}
                        placeholder="support@akcllc.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-end">
                      <div className="space-y-2">
                        <Label htmlFor="bccEmail">BCC Email (Optional)</Label>
                        <Input
                          id="bccEmail"
                          type="email"
                          value={bccEmail}
                          onChange={e => setBccEmail(e.target.value)}
                          disabled={isSavingConfig}
                          placeholder="records@akcllc.com"
                        />
                      </div>
                      <div className="flex items-center space-x-2 h-10">
                        <Checkbox
                          id="autoBcc"
                          checked={autoBcc}
                          onCheckedChange={checked => setAutoBcc(checked as boolean)}
                          disabled={isSavingConfig}
                        />
                        <Label htmlFor="autoBcc">Always BCC this address</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signature">Email Signature (Optional)</Label>
                      <Textarea
                        id="signature"
                        value={signature}
                        onChange={e => setSignature(e.target.value)}
                        disabled={isSavingConfig}
                        rows={5}
                        placeholder="Your signature here..."
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={handleSaveConfig}
                      disabled={isSavingConfig}
                      className="bg-[#0485ea] hover:bg-[#0375d1]"
                    >
                      {isSavingConfig ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Configuration'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTemplateDialog;
