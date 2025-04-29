import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

export const TimelogsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead>Employee</TableHead>
        <TableHead>Hours</TableHead>
        <TableHead>Notes</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
