
import { TableCell, TableRow, TableBody } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const SubcontractorLoadingState = () => {
  return (
    <TableBody>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Skeleton className="h-5 w-[70px] rounded-full" />
              <Skeleton className="h-5 w-[60px] rounded-full" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-3 w-[180px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-3 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-3 w-[120px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-[80px] rounded-full" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default SubcontractorLoadingState;
