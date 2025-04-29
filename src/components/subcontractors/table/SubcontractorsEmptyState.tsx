import { HardHat } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SubcontractorsEmptyStateProps {
  searchQuery: string;
}

const SubcontractorsEmptyState = ({ searchQuery }: SubcontractorsEmptyStateProps) => {
  const message = searchQuery
    ? `No subcontractors found matching "${searchQuery}"`
    : 'No subcontractors found. Add your first subcontractor!';

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
          <TableRow>
            <TableCell colSpan={7} className="h-52 text-center">
              <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
                <HardHat className="h-12 w-12 mb-2 text-muted-foreground/50" />
                <p>{message}</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default SubcontractorsEmptyState;
