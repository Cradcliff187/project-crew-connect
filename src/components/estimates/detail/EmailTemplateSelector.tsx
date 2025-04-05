
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { EstimateRevision } from '@/components/estimates/types/estimateTypes';

export interface EmailTemplate {
  id: string;
  template_name: string;
  subject_template: string;
  body_template: string;
  is_default: boolean;
}

interface EmailTemplateSelectorProps {
  onTemplateSelect: (template: EmailTemplate) => void;
  onCreateClick?: () => void;
  revision?: EstimateRevision;
  clientName?: string;
  disabled?: boolean;
}

const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({
  onTemplateSelect,
  onCreateClick,
  revision,
  clientName = 'Client',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    fetchEmailTemplates();
  }, []);

  const fetchEmailTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_email_settings')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setTemplates(data);
        
        const defaultTemplate = data.find(t => t.is_default);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
          applyTemplate(defaultTemplate);
        } else {
          setSelectedTemplateId(data[0].id);
          applyTemplate(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = (template: EmailTemplate) => {
    let processedSubject = template.subject_template;
    let processedBody = template.body_template;
    
    const variables: Record<string, string> = {
      clientName: clientName,
      revisionNumber: revision?.version.toString() || '1',
      estimateId: revision?.estimate_id || ''
    };
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedSubject = processedSubject.replace(regex, value);
      processedBody = processedBody.replace(regex, value);
    });
    
    onTemplateSelect({
      ...template,
      subject_template: processedSubject,
      body_template: processedBody
    });
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      applyTemplate(selectedTemplate);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="emailTemplate">Email Template</Label>
        {onCreateClick && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCreateClick}
            type="button"
            className="h-8 px-2 text-[#0485ea]"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            New Template
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading templates...
        </div>
      ) : (
        <Select
          value={selectedTemplateId || ''}
          onValueChange={handleTemplateChange}
          disabled={disabled || templates.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={templates.length === 0 ? "No templates available" : "Select a template"} />
          </SelectTrigger>
          <SelectContent>
            {templates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                {template.template_name} {template.is_default && "(Default)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default EmailTemplateSelector;
