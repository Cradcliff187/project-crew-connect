
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Star, StarOff, Trash2, Plus } from 'lucide-react';
import { EmailTemplate } from '../EmailTemplateSelector';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import EmailTemplateFormDialog from './EmailTemplateFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmailTemplatesManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EmailTemplatesManagerDialog: React.FC<EmailTemplatesManagerDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);
  
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_email_settings')
        .select('*')
        .order('is_default', { ascending: false })
        .order('template_name');
      
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
      setIsLoading(false);
    }
  };
  
  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setTemplateFormOpen(true);
  };
  
  const handleCreateTemplate = () => {
    setSelectedTemplateId(null);
    setTemplateFormOpen(true);
  };
  
  const handleSetDefault = async (templateId: string) => {
    try {
      // First, unset all default templates
      const { error: unsetError } = await supabase
        .from('estimate_email_settings')
        .update({ is_default: false })
        .not('id', 'eq', templateId);
      
      if (unsetError) throw unsetError;
      
      // Set this template as default
      const { error: setError } = await supabase
        .from('estimate_email_settings')
        .update({ is_default: true })
        .eq('id', templateId);
      
      if (setError) throw setError;
      
      toast({
        title: 'Default template updated',
        className: 'bg-[#0485ea] text-white',
      });
      
      fetchTemplates();
    } catch (error) {
      console.error('Error setting default template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update default template',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteTemplate = async () => {
    if (!deleteTemplateId) return;
    
    try {
      const { error } = await supabase
        .from('estimate_email_settings')
        .delete()
        .eq('id', deleteTemplateId);
      
      if (error) throw error;
      
      toast({
        title: 'Template deleted',
        className: 'bg-[#0485ea] text-white',
      });
      
      fetchTemplates();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };
  
  const confirmDelete = (templateId: string) => {
    setDeleteTemplateId(templateId);
    setDeleteDialogOpen(true);
  };
  
  const handleTemplateFormSuccess = () => {
    setTemplateFormOpen(false);
    fetchTemplates();
    if (onSuccess) {
      onSuccess();
    }
  };
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Email Templates</span>
            <Button onClick={handleCreateTemplate} className="bg-[#0485ea] hover:bg-[#0373ce]">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No email templates found.</p>
              <Button 
                onClick={handleCreateTemplate} 
                className="mt-4 bg-[#0485ea] hover:bg-[#0373ce]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Template Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map(template => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {template.template_name}
                          {template.is_default && (
                            <Badge className="bg-[#0485ea]">Default</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{truncateText(template.subject_template, 60)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!template.is_default && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSetDefault(template.id)}
                              title="Set as default"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTemplate(template.id)}
                            title="Edit template"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(template.id)}
                            title="Delete template"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
      
      <EmailTemplateFormDialog
        open={templateFormOpen}
        onOpenChange={setTemplateFormOpen}
        templateId={selectedTemplateId || undefined}
        onSuccess={handleTemplateFormSuccess}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the email template. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default EmailTemplatesManagerDialog;
