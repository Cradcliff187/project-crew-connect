
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

interface SubcontractorErrorStateProps {
  error: string;
}

const SubcontractorErrorState = ({ error }: SubcontractorErrorStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-6 text-red-500">
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
