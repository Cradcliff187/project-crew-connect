import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const SubcontractorsLoadingState = () => {
  return (
    <div className="rounded-md border shadow-sm animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Specialties</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i} className="hover:bg-muted/50">
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[80px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[150px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[150px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[80px] rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubcontractorsLoadingState;
