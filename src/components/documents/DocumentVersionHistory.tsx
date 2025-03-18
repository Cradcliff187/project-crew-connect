
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock, FileClock, FileUp, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Document } from './schemas/documentSchema';
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface DocumentVersionHistoryProps {
  entityType: string;
  entityId: string;
  category?: string;
}

const DocumentVersionHistory = ({ entityType, entityId, category }: DocumentVersionHistoryProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [versionGroups, setVersionGroups] = useState<Record<string, Document[]>>({});

  useEffect(() => {
    fetchDocumentVersions();
  }, [entityType, entityId, category]);

  const fetchDocumentVersions = async () => {
    setIsLoading(true);
    try {
      // Construct the query based on the provided parameters
      let query = supabase
        .from('documents')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      // Add category filter if provided
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get public URLs for all documents
      const docsWithUrls = await Promise.all((data || []).map(async (doc) => {
        const { data: { publicUrl } } = supabase.storage
          .from('construction_documents')
          .getPublicUrl(doc.storage_path);
        
        return {
          ...doc,
          url: publicUrl
        };
      }));

      // Group documents by file_name (assuming documents with the same name are versions)
      const groupedVersions: Record<string, Document[]> = {};
      docsWithUrls.forEach(doc => {
        const baseFileName = doc.file_name.split('.').slice(0, -1).join('.');
        if (!groupedVersions[baseFileName]) {
          groupedVersions[baseFileName] = [];
        }
        groupedVersions[baseFileName].push(doc);
      });

      // Sort each group by version number (or created_at if version is not available)
      Object.keys(groupedVersions).forEach(key => {
        groupedVersions[key].sort((a, b) => {
          if (a.version && b.version) {
            return b.version - a.version;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      });

      setVersionGroups(groupedVersions);
    } catch (error) {
      console.error('Error fetching document versions:', error);
      toast({
        title: "Error",
        description: "Failed to load document versions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading document versions...</span>
      </div>
    );
  }

  if (Object.keys(versionGroups).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Documents Found</CardTitle>
          <CardDescription>
            No document versions are available for this {entityType.toLowerCase()}.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Document Version History</h3>
      
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(versionGroups).map(([fileName, versions]) => (
          <AccordionItem key={fileName} value={fileName}>
            <AccordionTrigger className="hover:bg-muted/50 px-4 py-2 rounded-md">
              <div className="flex items-center">
                <FileClock className="h-5 w-5 mr-2 text-[#0485ea]" />
                <span>{fileName}</span>
                <Badge className="ml-2 bg-[#0485ea]">{versions.length} versions</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-4">
                {versions.map((doc, index) => (
                  <div key={doc.document_id} className="border p-3 rounded-md flex justify-between items-center">
                    <div>
                      <div className="font-medium flex items-center">
                        {index === 0 && (
                          <Badge className="mr-2 bg-green-600">Latest</Badge>
                        )}
                        Version {doc.version || index + 1}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(doc.created_at)}
                        {doc.uploaded_by && (
                          <span className="ml-1">by {doc.uploaded_by}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} download={doc.file_name}>
                          <FileUp className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default DocumentVersionHistory;
