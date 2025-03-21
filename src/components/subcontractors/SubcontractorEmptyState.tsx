
import { TableCell, TableRow } from '@/components/ui/table';
import { Hammer } from 'lucide-react';

const SubcontractorEmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
        <Hammer className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
        <p>No subcontractors found. Add your first subcontractor!</p>
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorEmptyState;
