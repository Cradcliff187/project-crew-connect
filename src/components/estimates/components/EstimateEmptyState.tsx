
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { FileText } from 'lucide-react';

const EstimateEmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-lg font-montserrat">No estimates found</p>
        <p className="text-sm mt-1">Create your first estimate to get started.</p>
      </TableCell>
    </TableRow>
  );
};

export default EstimateEmptyState;
