
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const TimelogsTableHeader = () => {
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

export default TimelogsTableHeader;
