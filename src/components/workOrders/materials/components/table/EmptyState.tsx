
import { TableCell, TableRow } from '@/components/ui/table';
import { Package2 } from 'lucide-react';

const EmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={5} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Package2 className="h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm">No materials added yet</p>
          <p className="text-xs mt-1">Add materials using the button above</p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyState;
