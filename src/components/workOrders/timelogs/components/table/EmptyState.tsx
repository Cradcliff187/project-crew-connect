import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Clock } from 'lucide-react';

const EmptyState = () => {
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={5} className="h-52 text-center">
          <div className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No time entries yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Use the Log Time button to track hours spent on this work order.
            </p>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

export default EmptyState;
