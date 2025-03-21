
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  onToggleUploadForm: () => void;
}

const EmptyState = ({ onToggleUploadForm }: EmptyStateProps) => {
  return (
    <div className="text-center py-8 border rounded-md">
      <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
      <p className="text-muted-foreground">No documents attached to this work order</p>
      <Button 
        variant="outline" 
        className="mt-4 text-[#0485ea]"
        onClick={onToggleUploadForm}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Document
      </Button>
    </div>
  );
};

export default EmptyState;
