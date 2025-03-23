
import { TableCell, TableRow } from '@/components/ui/table';
import { Package2 } from 'lucide-react';

const EmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-52 text-center">
        <div className="flex flex-col items-center justify-center p-6">
          <div className="rounded-full bg-muted p-3 mb-3">
            <Package2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No materials yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Add your first material by clicking the 'Add Material' button above. You can track materials, supplies, and other costs.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyState;
