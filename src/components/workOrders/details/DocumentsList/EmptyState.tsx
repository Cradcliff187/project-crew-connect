
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  onToggleUploadForm: () => void;
}

const EmptyState = ({ onToggleUploadForm }: EmptyStateProps) => {
  return (
    <div className="text-center py-8 border rounded-md bg-card shadow-sm">
      <div className="rounded-full bg-warmgray-100 p-3 mx-auto w-fit mb-3">
        <FileText className="h-10 w-10 text-warmgray-500" />
      </div>
      <p className="text-muted-foreground">No documents attached to this work order</p>
      <Button 
        variant="outline" 
        className="mt-4 border-construction-200 text-construction-600 hover:bg-construction-50"
        onClick={onToggleUploadForm}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Document
      </Button>
    </div>
  );
};

export default EmptyState;
