
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileHistory, Upload, Eye, Clock, Info } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { formatDate } from '@/lib/utils';
import { useDocumentVersions } from './hooks/useDocumentVersions';
import { FileUpload } from '@/components/ui/file-upload';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import DocumentViewer from './DocumentViewer';

interface DocumentVersionHistoryCardProps {
  documentId: string;
  onVersionChange?: (version: Document) => void;
}

const DocumentVersionHistoryCard: React.FC<DocumentVersionHistoryCardProps> = ({
  documentId,
  onVersionChange
}) => {
  const { versions, loading, error, uploadNewVersion, refetchVersions } = useDocumentVersions(documentId);
  const [uploadMode, setUploadMode] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [versionNotes, setVersionNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);

  // Find the latest version
  const latestVersion = versions.find(v => v.is_latest_version) || versions[0];

  const handleUploadClick = () => {
    setUploadMode(true);
  };

  const handleCancelUpload = () => {
    setUploadMode(false);
    setUploadFiles([]);
    setVersionNotes('');
  };

  const handleFilesSelected = (files: File[]) => {
    // Only use the first file
    if (files.length > 0) {
      setUploadFiles([files[0]]);
    }
  };

  const handleUploadVersion = async () => {
    if (!uploadFiles.length) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload as a new version",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadNewVersion(uploadFiles[0], { notes: versionNotes });
      
      if (result.success) {
        toast({
          title: "Version uploaded",
          description: "New version has been uploaded successfully"
        });
        
        setUploadMode(false);
        setUploadFiles([]);
        setVersionNotes('');
        
        // Refresh versions
        refetchVersions();
        
        // Notify parent if needed
        if (onVersionChange && result.document) {
          onVersionChange(result.document);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Failed to upload new version",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewVersion = (document: Document) => {
    setViewDocument(document);
  };

  const handleSelectVersion = (document: Document) => {
    if (onVersionChange) {
      onVersionChange(document);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileHistory className="mr-2 h-5 w-5" />
            Document History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="animate-pulse">Loading version history...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileHistory className="mr-2 h-5 w-5" />
            Document History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 p-4 rounded text-red-800 text-sm">
            Error loading version history: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (uploadMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload New Version
          </CardTitle>
          <CardDescription>
            Upload a new version of this document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="versionNotes">Version Notes</Label>
            <Input
              id="versionNotes"
              placeholder="Describe the changes in this version"
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
            />
          </div>
          
          <FileUpload
            onFilesSelected={handleFilesSelected}
            onFileClear={() => setUploadFiles([])}
            selectedFiles={uploadFiles}
            allowMultiple={false}
            acceptedFileTypes="*/*"
            dropzoneText="Drop new version here or click to browse"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCancelUpload}>
            Cancel
          </Button>
          <Button onClick={handleUploadVersion} disabled={isUploading || !uploadFiles.length}>
            {isUploading ? 'Uploading...' : 'Upload New Version'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <FileHistory className="mr-2 h-5 w-5" />
            Document History
          </CardTitle>
          <CardDescription>
            {versions.length} version{versions.length !== 1 ? 's' : ''}
          </CardDescription>
        </div>
        <Button size="sm" onClick={handleUploadClick}>
          <Upload className="h-4 w-4 mr-2" />
          New Version
        </Button>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No version history found for this document
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div 
                key={version.document_id} 
                className={`flex items-center justify-between p-3 rounded-md border ${
                  version.is_latest_version ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-sm truncate mr-2">
                      {version.file_name}
                    </span>
                    {version.is_latest_version && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(version.created_at || '')}
                    <span className="mx-2">•</span>
                    <span>V{version.version || 1}</span>
                  </div>
                  {version.notes && (
                    <div className="flex items-start mt-1">
                      <Info className="h-3 w-3 mr-1 text-gray-400 mt-0.5" />
                      <p className="text-xs text-gray-600 truncate">{version.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={() => handleViewVersion(version)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={version.is_latest_version ? "ghost" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => handleSelectVersion(version)}
                  >
                    Use Version
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <DocumentViewer
        document={viewDocument}
        open={!!viewDocument}
        onOpenChange={(open) => !open && setViewDocument(null)}
      />
    </Card>
  );
};

export default DocumentVersionHistoryCard;
