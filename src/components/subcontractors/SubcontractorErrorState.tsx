
import { TableCell, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubcontractorErrorStateProps {
  error: string;
}

const SubcontractorErrorState = ({ error }: SubcontractorErrorStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-6 text-red-500">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>Error loading subcontractors: {error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorErrorState;
