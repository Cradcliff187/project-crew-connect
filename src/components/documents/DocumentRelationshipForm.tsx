
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDocuments } from './hooks/useDocuments';
import { Loader2, Search, Link, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Document } from './schemas/documentSchema';
import { CreateRelationshipParams, RelationshipType } from '@/hooks/useDocumentRelationships';

interface DocumentRelationshipFormProps {
  sourceDocumentId: string;
  onCreateRelationship: (params: CreateRelationshipParams) => Promise<any>;
  onCancel: () => void;
}

const relationshipOptions: { value: RelationshipType; label: string }[] = [
  { value: 'RELATED', label: 'Related Document' },
  { value: 'REFERENCE', label: 'Referenced Document' },
  { value: 'SUPPLEMENT', label: 'Supplementary Document' },
  { value: 'ATTACHMENT', label: 'Attachment' },
];

const DocumentRelationshipForm: React.FC<DocumentRelationshipFormProps> = ({
  sourceDocumentId,
  onCreateRelationship,
  onCancel
}) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('RELATED');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use the useDocuments hook to search for documents
  const { 
    documents, 
    loading,
  } = useDocuments({
    search: searchQuery,
    sortBy: 'newest'
  });
  
  // Filter out the current document and any already linked documents
  const filteredDocuments = documents.filter(doc => 
    doc.document_id !== sourceDocumentId
  );
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDocumentId) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onCreateRelationship({
        sourceDocumentId,
        targetDocumentId: selectedDocumentId,
        relationshipType,
        metadata: { description }
      });
      
      // Reset form after successful creation
      setSelectedDocumentId('');
      setRelationshipType('RELATED');
      setDescription('');
      onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSelectDocument = (document: Document) => {
    setSelectedDocumentId(document.document_id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search-documents">Find document to link</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-documents"
            placeholder="Search for documents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="border rounded-md max-h-48 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-5 w-5 text-[#0485ea] animate-spin" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No documents found
          </div>
        ) : (
          <div className="divide-y">
            {filteredDocuments.map((document) => (
              <div
                key={document.document_id}
                className={`p-2 cursor-pointer hover:bg-slate-50 flex items-center justify-between ${
                  selectedDocumentId === document.document_id ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelectDocument(document)}
              >
                <div className="flex items-center">
                  <Link className="h-4 w-4 mr-2 text-[#0485ea]" />
                  <div className="truncate">{document.file_name}</div>
                </div>
                {selectedDocumentId === document.document_id && (
                  <Plus className="h-4 w-4 text-[#0485ea]" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="relationship-type">Relationship Type</Label>
        <Select 
          value={relationshipType}
          onValueChange={(value) => setRelationshipType(value as RelationshipType)}
        >
          <SelectTrigger id="relationship-type">
            <SelectValue placeholder="Select relationship type" />
          </SelectTrigger>
          <SelectContent>
            {relationshipOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Add a description for this relationship"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!selectedDocumentId || isSubmitting}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Relationship
        </Button>
      </div>
    </form>
  );
};

export default DocumentRelationshipForm;
