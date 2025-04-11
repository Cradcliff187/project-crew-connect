
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/ui/file-upload';
import { DocumentCategory, EntityType, entityTypes } from './schemas/documentSchema';
import { toast } from '@/components/ui/use-toast';
import { useDocumentUpload } from './hooks/useDocumentUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DocumentUploadProps {
  projectId?: string;
  entityType?: EntityType;
  entityId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  projectId,
  entityType,
  entityId,
  onSuccess,
  onCancel
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [currentEntityType, setCurrentEntityType] = useState<EntityType>(entityType || 'PROJECT');
  const [currentEntityId, setCurrentEntityId] = useState(entityId || projectId || '');
  
  const { uploadDocument, loading } = useDocumentUpload(currentEntityType, currentEntityId, {
    onSuccess,
  });
  
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  const handleClearFiles = () => {
    setSelectedFiles([]);
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  const handleCategoryChange = (value: string) => {
    setCategory(value as DocumentCategory);
  };
  
  const handleEntityTypeChange = (value: string) => {
    setCurrentEntityType(value as EntityType);
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Upload each file individually
      for (const file of selectedFiles) {
        await uploadDocument(file, {
          category,
          notes,
        });
      }
      
      toast({
        title: "Upload successful",
        description: "Documents have been uploaded successfully",
      });
      
      // Reset form
      setSelectedFiles([]);
      setNotes('');
      setCategory('other');
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading the documents",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="3rd_party_estimate">Third Party Estimate</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="certification">Certification</SelectItem>
              <SelectItem value="photo">Photo</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="entity-type">Entity Type</Label>
          <Select
            value={currentEntityType}
            onValueChange={handleEntityTypeChange}
            disabled={!!entityType}
          >
            <SelectTrigger id="entity-type">
              <SelectValue placeholder="Select entity type" />
            </SelectTrigger>
            <SelectContent>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="entity-id">Entity ID</Label>
          <Input
            id="entity-id"
            value={currentEntityId}
            onChange={(e) => setCurrentEntityId(e.target.value)}
            disabled={!!entityId || !!projectId}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional information about this document"
            value={notes}
            onChange={handleNotesChange}
          />
        </div>
        
        <div>
          <Label>Files</Label>
          <FileUpload
            onFilesSelected={handleFilesSelected}
            onFileClear={handleClearFiles}
            selectedFiles={selectedFiles}
            allowMultiple={true}
            acceptedFileTypes="*/*"
            dropzoneText="Drag and drop files here, or click to browse"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={handleUpload} disabled={loading || selectedFiles.length === 0}>
          {loading ? 'Uploading...' : 'Upload'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentUpload;
