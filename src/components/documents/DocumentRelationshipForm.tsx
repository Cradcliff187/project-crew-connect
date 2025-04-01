
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Document } from './schemas/documentSchema';
import { CreateRelationshipParams, RelationshipType } from '@/hooks/useDocumentRelationships';

interface DocumentRelationshipFormProps {
  documentId: string;
  onCreateRelationship: (params: CreateRelationshipParams) => Promise<any>;
  onCancel: () => void;
}

type FormValues = {
  targetDocumentId: string;
  relationshipType: RelationshipType;
  description: string;
  searchTerm: string;
};

const relationshipOptions: { value: RelationshipType; label: string; description: string }[] = [
  { value: 'REFERENCE', label: 'References', description: 'This document refers to the selected document' },
  { value: 'VERSION', label: 'Version of', description: 'This document is a version of the selected document' },
  { value: 'ATTACHMENT', label: 'Attachment to', description: 'This document is an attachment to the selected document' },
  { value: 'RELATED', label: 'Related to', description: 'These documents are related to each other' },
  { value: 'SUPPLEMENT', label: 'Supplements', description: 'This document supplements the selected document' }
];

const DocumentRelationshipForm: React.FC<DocumentRelationshipFormProps> = ({
  documentId,
  onCreateRelationship,
  onCancel
}) => {
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    defaultValues: {
      targetDocumentId: '',
      relationshipType: 'RELATED',
      description: '',
      searchTerm: ''
    }
  });
  
  // Search for documents
  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .ilike('file_name', `%${searchTerm}%`)
        .neq('document_id', documentId) // Exclude the current document
        .limit(10);
      
      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (err: any) {
      console.error('Error searching for documents:', err);
      toast({
        title: 'Search error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setSearching(false);
    }
  }, [documentId]);
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!values.targetDocumentId) {
      toast({
        title: 'Validation error',
        description: 'Please select a document to link to',
        variant: 'destructive'
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      await onCreateRelationship({
        sourceDocumentId: documentId,
        targetDocumentId: values.targetDocumentId,
        relationshipType: values.relationshipType,
        metadata: {
          description: values.description
        }
      });
      
      // Reset form
      form.reset({
        targetDocumentId: '',
        relationshipType: 'RELATED',
        description: '',
        searchTerm: ''
      });
      
      // Clear search results
      setSearchResults([]);
    } catch (error) {
      console.error('Error creating relationship:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Watch for changes in search term
  const searchTerm = form.watch('searchTerm');
  
  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, handleSearch]);
  
  // Handle document selection
  const handleSelectDocument = (document: Document) => {
    form.setValue('targetDocumentId', document.document_id);
    form.setValue('searchTerm', document.file_name);
    setSearchResults([]);
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-[#0485ea]" />
            Create Document Relationship
          </div>
        </CardTitle>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="searchTerm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search for a document</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Search by document name..."
                        {...field}
                      />
                      {searching && (
                        <div className="absolute right-2 top-2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Search results dropdown */}
                      {searchResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full border rounded-md bg-white shadow-lg max-h-60 overflow-auto">
                          {searchResults.map(doc => (
                            <div 
                              key={doc.document_id}
                              className="p-2 hover:bg-muted cursor-pointer border-b last:border-0"
                              onClick={() => handleSelectDocument(doc)}
                            >
                              <div className="font-medium truncate">{doc.file_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {doc.entity_type}: {doc.entity_id}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <input 
              type="hidden" 
              {...form.register('targetDocumentId')}
            />
            
            <FormField
              control={form.control}
              name="relationshipType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship Type</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relationshipOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div>{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe why these documents are related..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="justify-between">
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
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={!form.getValues('targetDocumentId') || submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Relationship
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default DocumentRelationshipForm;
