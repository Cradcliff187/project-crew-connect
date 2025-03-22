
import { TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Clock } from 'lucide-react';

const EmptyState = () => {
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={5} className="h-24 text-center">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Clock size={36} className="mb-3 text-gray-300" />
            <p className="font-medium">No time entries added yet</p>
            <p className="text-sm mt-1">Use the Log Time button to track hours spent on this work order.</p>
          </div>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};

export default EmptyState;
