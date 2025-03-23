
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  onToggleUploadForm: () => void;
}

const EmptyState = ({ onToggleUploadForm }: EmptyStateProps) => {
  return (
    <div className="text-center py-8 px-4 border rounded-md bg-muted/20">
      <div className="rounded-full bg-muted p-3 mx-auto w-fit mb-3">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No documents attached</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
        Upload documents and receipts related to this work order for easy access.
      </p>
      <Button 
        variant="outline" 
        className="border-[#0485ea]/30 text-[#0485ea] hover:bg-[#0485ea]/10"
        onClick={onToggleUploadForm}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Document
      </Button>
    </div>
  );
};

export default EmptyState;
