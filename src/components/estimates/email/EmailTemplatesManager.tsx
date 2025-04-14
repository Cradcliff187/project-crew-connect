import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Mail, Edit2, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EmailTemplateFormDialog from '../detail/dialogs/EmailTemplateFormDialog';

interface EmailTemplate {
  id: string;
  template_name: string;
  subject_template: string;
  body_template: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const EmailTemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmailTemplates();
  }, []);

  const fetchEmailTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_email_settings')
        .select('*')
        .order('is_default', { ascending: false })
        .order('template_name', { ascending: true });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setFormDialogOpen(true);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplateId(null);
    setFormDialogOpen(true);
  };

  const handleDeletePrompt = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    setDeleteInProgress(true);
    try {
      const { error } = await supabase
        .from('estimate_email_settings')
        .delete()
        .eq('id', templateToDelete);

      if (error) throw error;

      toast({
        title: 'Template Deleted',
        description: 'Email template has been deleted successfully',
        className: 'bg-[#0485ea] text-white',
      });

      // Refresh the list
      fetchEmailTemplates();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete template',
        variant: 'destructive',
      });
    } finally {
      setDeleteInProgress(false);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleSuccess = () => {
    fetchEmailTemplates();
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Mail className="mr-2 h-5 w-5 text-[#0485ea]" />
            Email Templates
          </CardTitle>
          <Button onClick={handleCreateTemplate} className="bg-[#0485ea] hover:bg-[#0373ce]">
            <PlusCircle className="h-4 w-4 mr-1.5" />
            New Template
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
              <p className="text-muted-foreground">No email templates found</p>
              <Button variant="outline" onClick={handleCreateTemplate} className="mt-4">
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Create First Template
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 flex justify-between items-start"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{template.template_name}</h3>
                      {template.is_default && (
                        <Badge
                          variant="secondary"
                          className="bg-[#0485ea]/10 text-[#0485ea] hover:bg-[#0485ea]/20"
                        >
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate max-w-lg">
                      {template.subject_template}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrompt(template.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                      disabled={template.is_default}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EmailTemplateFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        templateId={selectedTemplateId || undefined}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this email template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              disabled={deleteInProgress}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmailTemplatesManager;
