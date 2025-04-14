import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const EstimateLoadingState = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell>
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[150px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[120px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-[80px] rounded-full" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-8 w-8 rounded-full ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default EstimateLoadingState;
