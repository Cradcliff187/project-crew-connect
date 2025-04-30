import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

const EstimateEmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="h-[200px] text-center">
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground/50" />}
          title="No estimates found"
          description="Create a new estimate or adjust your search query."
        />
      </TableCell>
    </TableRow>
  );
};

export default EstimateEmptyState;
