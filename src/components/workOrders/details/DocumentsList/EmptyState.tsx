
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onToggleUploadForm: () => void;
}

const EmptyState = ({ onToggleUploadForm }: EmptyStateProps) => {
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={5} className="h-52 text-center">
          <div className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-muted p-3 mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No documents uploaded yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Upload documents, receipts, and files related to this work order.
            </p>
            <Button 
              onClick={onToggleUploadForm}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Upload Document
            </Button>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

export default EmptyState;
