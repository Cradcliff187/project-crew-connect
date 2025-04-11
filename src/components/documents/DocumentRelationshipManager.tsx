
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Document } from './schemas/documentSchema';
import { toast } from '@/hooks/use-toast';
import { Link2, Search, X } from 'lucide-react';

interface DocumentRelationshipManagerProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRelationshipCreated?: () => void;
}

interface DocumentWithRelation extends Document {
  relationshipType?: string;
}

const RELATIONSHIP_TYPES = [
  { label: 'Related To', value: 'related_to' },
  { label: 'Previous Version', value: 'previous_version' },
  { label: 'Revision Of', value: 'revision_of' },
  { label: 'Attachment For', value: 'attachment_for' },
  { label: 'Source Document', value: 'source_document' },
  { label: 'Supporting Document', value: 'supporting_document' },
];

const DocumentRelationshipManager: React.FC<DocumentRelationshipManagerProps> = ({
  document,
  open,
  onOpenChange,
  onRelationshipCreated
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithRelation | null>(null);
  const [relationshipType, setRelationshipType] = useState('related_to');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (open && document) {
      setSearchTerm('');
      setSearchResults([]);
      setSelectedDocument(null);
      setRelationshipType('related_to');
    }
  }, [open, document]);
  
  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 3) {
      toast({
        title: "Search query too short",
        description: "Please enter at least 3 characters to search",
        variant: "default"
      });
      return;
    }
    
    setSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('documents_with_urls')
        .select('*')
        .ilike('file_name', `%${searchTerm}%`)
        .neq('document_id', document.document_id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      setSearchResults(data);
      
      if (data.length === 0) {
        toast({
          title: "No documents found",
          description: "Try a different search term",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error searching documents:', error);
      toast({
        title: "Search failed",
        description: "Failed to search for documents",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };
  
  const handleSelectDocument = (doc: Document) => {
    setSelectedDocument({
      ...doc,
      relationshipType: relationshipType
    });
  };
  
  const handleCreateRelationship = async () => {
    if (!selectedDocument) return;
    
    setSubmitting(true);
    
    try {
      const relationshipData = {
        source_document_id: document.document_id,
        target_document_id: selectedDocument.document_id,
        relationship_type: relationshipType,
      };
      
      const { error } = await supabase
        .from('document_relationships')
        .insert(relationshipData);
        
      if (error) throw error;
      
      toast({
        title: "Relationship created",
        description: "Documents have been linked successfully"
      });
      
      if (onRelationshipCreated) {
        onRelationshipCreated();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating relationship:', error);
      toast({
        title: "Failed to create relationship",
        description: "An error occurred while linking documents",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Link Documents</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for documents by filename..."
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={searching || searchTerm.length < 3} 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          </div>
          
          {searching ? (
            <div className="py-8 text-center">
              <div className="animate-spin inline-block size-6 border-2 border-current border-t-transparent rounded-full text-[#0485ea]" role="status" aria-label="loading">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map(doc => (
                  <div 
                    key={doc.document_id}
                    className={`p-3 border-b hover:bg-[#0485ea]/5 cursor-pointer ${
                      selectedDocument?.document_id === doc.document_id ? 'bg-[#0485ea]/10 border-l-2 border-[#0485ea]' : ''
                    }`}
                    onClick={() => handleSelectDocument(doc)}
                  >
                    <div className="flex items-center">
                      <div className="mr-2">
                        <FileTypeIcon fileType={doc.file_type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.category || 'Document'} • {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          
          {selectedDocument && (
            <Card className="border-[#0485ea]/20 mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Selected Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileTypeIcon fileType={selectedDocument.file_type} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedDocument.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedDocument.category || 'Document'} • {new Date(selectedDocument.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-muted-foreground"
                    onClick={() => setSelectedDocument(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Relationship Type</label>
                  <select
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={relationshipType}
                    onChange={(e) => setRelationshipType(e.target.value)}
                  >
                    {RELATIONSHIP_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={submitting || !selectedDocument}
              onClick={handleCreateRelationship}
            >
              <Link2 className="h-4 w-4 mr-1" />
              {submitting ? 'Creating Link...' : 'Create Link'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FileTypeIcon: React.FC<{ fileType?: string }> = ({ fileType }) => {
  // Determine icon based on file type
  let icon;
  
  if (!fileType) {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-muted-foreground">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  } else if (fileType.includes('image')) {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-500">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    );
  } else if (fileType.includes('pdf')) {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-red-500">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  } else {
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-muted-foreground">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  }
  
  return <div className="flex items-center justify-center">{icon}</div>;
};

export default DocumentRelationshipManager;
