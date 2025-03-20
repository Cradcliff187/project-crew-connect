
import { TableCell, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';

interface SubcontractorErrorStateProps {
  error: string;
}

const SubcontractorErrorState = ({ error }: SubcontractorErrorStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center text-destructive">
          <AlertTriangle className="h-8 w-8 mb-2" />
          <p>Error loading subcontractors</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorErrorState;
