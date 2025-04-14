import { TableCell, TableRow } from '@/components/ui/table';
import { DollarSign } from 'lucide-react';

const EmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-52 text-center">
        <div className="flex flex-col items-center justify-center p-6">
          <div className="rounded-full bg-muted p-3 mb-3">
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Add your first expense by clicking the 'Add Expense' button above. You can track
            materials, supplies, and other costs.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyState;
