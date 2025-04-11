
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Document, 
  RelationshipType, 
  CreateRelationshipParams 
} from './schemas/documentSchema';
import { parseEntityType } from './utils/documentTypeUtils';

// Form validation schema
const formSchema = z.object({
  targetDocumentId: z.string({
    required_error: "Please select a document to link",
  }),
  relationshipType: z.string({
    required_error: "Please select a relationship type",
  }),
});

interface DocumentRelationshipFormProps {
  sourceDocumentId: string;
  onSuccess: () => void;
  onCancel: () => void;
  excludeDocumentIds?: string[];
}

const DocumentRelationshipForm: React.FC<DocumentRelationshipFormProps> = ({
  sourceDocumentId,
  onSuccess,
  onCancel,
  excludeDocumentIds = []
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetDocumentId: '',
      relationshipType: 'RELATED',
    },
  });

  // Fetch available documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // Get all documents except the source and excluded ones
        const excludeIds = [sourceDocumentId, ...excludeDocumentIds];
        const excludeIdsString = excludeIds.map(id => `'${id}'`).join(',');
        
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .not('document_id', 'in', `(${excludeIdsString})`)
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        // Parse the results and convert entity_type strings to EntityType enum
        const parsedDocuments: Document[] = (data || []).map(doc => ({
          ...doc,
          entity_type: parseEntityType(doc.entity_type)
        }));
        
        setDocuments(parsedDocuments);
      } catch (err: any) {
        console.error('Error fetching documents:', err);
        toast({
          title: 'Error',
          description: 'Failed to load available documents',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [sourceDocumentId, excludeDocumentIds]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    
    try {
      // Create relationship parameters
      const relationshipParams: CreateRelationshipParams = {
        sourceDocumentId,
        targetDocumentId: values.targetDocumentId,
        relationshipType: values.relationshipType as RelationshipType,
        metadata: {
          created_by: 'system',
          description: 'Document relationship'
        }
      };
      
      // Insert the relationship into the database
      const { data, error } = await supabase
        .from('document_relationships')
        .insert({
          source_document_id: relationshipParams.sourceDocumentId,
          target_document_id: relationshipParams.targetDocumentId,
          relationship_type: relationshipParams.relationshipType,
          relationship_metadata: relationshipParams.metadata
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          // Unique constraint error
          throw new Error('A relationship already exists between these documents');
        }
        throw error;
      }
      
      toast({
        title: 'Relationship created',
        description: 'Documents have been linked successfully',
      });
      
      onSuccess();
    } catch (err: any) {
      console.error('Error creating relationship:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to create document relationship',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRelationshipOptions = () => [
    { value: RelationshipType.RELATED, label: 'Related to' },
    { value: RelationshipType.REFERENCE, label: 'References' },
    { value: RelationshipType.VERSION, label: 'Version of' },
    { value: RelationshipType.PARENT_CHILD, label: 'Child of' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="targetDocumentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document to Link</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a document" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-80">
                  {documents.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      No documents available to link
                    </div>
                  ) : (
                    documents.map((doc) => (
                      <SelectItem 
                        key={doc.document_id} 
                        value={doc.document_id}
                        className="text-sm"
                      >
                        <div className="truncate">
                          {doc.file_name} 
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({formatDate(doc.created_at)})
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="relationshipType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getRelationshipOptions().map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={submitting || documents.length === 0}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Relationship'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DocumentRelationshipForm;

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}
