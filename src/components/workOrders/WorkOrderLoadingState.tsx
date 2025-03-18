
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const WorkOrderLoadingState = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>PO Number</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
              <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
              <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
              <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
              <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
              <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-[60px] ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkOrderLoadingState;
