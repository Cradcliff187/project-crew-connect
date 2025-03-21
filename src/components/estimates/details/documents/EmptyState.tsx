
import React from 'react';
import { FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  startUpload: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ startUpload }) => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <FileType className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
      <p>No documents attached to this estimate yet.</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-3 text-[#0485ea]"
        onClick={startUpload}
      >
        Upload your first document
      </Button>
    </div>
  );
};

export default EmptyState;
