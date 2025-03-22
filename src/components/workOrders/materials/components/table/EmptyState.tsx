
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Package2 } from 'lucide-react';

const EmptyState = () => {
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={6} className="h-24 text-center">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Package2 size={36} className="mb-3 text-gray-300" />
            <p className="font-medium">No materials added yet</p>
            <p className="text-sm mt-1">Use the Add Material button to track materials used in this work order.</p>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

export default EmptyState;
