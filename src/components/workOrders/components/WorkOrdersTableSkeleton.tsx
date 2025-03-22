
import { Skeleton } from '@/components/ui/skeleton';
import { TableRow, TableBody, TableCell } from "@/components/ui/table";

interface WorkOrdersTableSkeletonProps {
  rows?: number;
}

const WorkOrdersTableSkeleton = ({ rows = 5 }: WorkOrdersTableSkeletonProps) => {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
          <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default WorkOrdersTableSkeleton;
