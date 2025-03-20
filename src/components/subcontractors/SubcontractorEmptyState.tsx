
import { TableCell, TableRow } from '@/components/ui/table';
import { Hammer } from 'lucide-react';

const SubcontractorEmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center">
          <Hammer className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-muted-foreground">No subcontractors found. Add your first subcontractor!</p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorEmptyState;
