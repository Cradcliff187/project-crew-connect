import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { FileText } from 'lucide-react';

const EstimateEmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-[200px] text-center">
        <div className="flex flex-col items-center justify-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-2" />
          <h3 className="text-lg font-medium text-gray-600">No estimates found</h3>
          <p className="text-sm text-gray-500 mt-2">
            Create a new estimate or adjust your search query.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EstimateEmptyState;
