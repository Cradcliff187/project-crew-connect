
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import DocumentsGrid from './DocumentsGrid';
import { useProjectDocuments } from './useProjectDocuments';
import { ProjectDocument } from './types';

interface ProjectDocumentsListProps {
  projectId: string;
}

const ProjectDocumentsList = ({ projectId }: ProjectDocumentsListProps) => {
  const { documents, loading, fetchDocuments } = useProjectDocuments(projectId);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [viewDocument, setViewDocument] = useState<ProjectDocument | null>(null);
  
  // Toggle document upload form
  const toggleUploadForm = () => {
    setShowUploadForm(!showUploadForm);
  };

  // Handle successful document upload
  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchDocuments();
  };
  
  // Handle view document
  const handleViewDocument = (doc: ProjectDocument) => {
    setViewDocument(doc);
  };
  
  // Close document viewer
  const handleCloseViewer = () => {
    setViewDocument(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Project Documents</CardTitle>
          <Button 
            variant={showUploadForm ? "outline" : "default"}
            className={showUploadForm 
              ? "text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50" 
              : "bg-[#0485ea] hover:bg-[#0375d1]"}
            onClick={toggleUploadForm}
          >
            {showUploadForm ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancel Upload
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-1" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {showUploadForm && (
          <div className="mb-6">
            <EnhancedDocumentUpload 
              entityType={"PROJECT" as EntityType}
              entityId={projectId}
              onSuccess={handleUploadSuccess}
              onCancel={() => setShowUploadForm(false)}
            />
          </div>
        )}
        
        <DocumentsGrid 
          documents={documents}
          loading={loading}
          onViewDocument={handleViewDocument}
          onToggleUploadForm={toggleUploadForm}
        />
      </CardContent>
    </Card>
  );
};

export default ProjectDocumentsList;
