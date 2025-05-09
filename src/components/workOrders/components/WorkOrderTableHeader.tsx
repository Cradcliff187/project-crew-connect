import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

const WorkOrderTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>WO Number</TableHead>
        <TableHead>PO Number</TableHead>
        <TableHead>Due Date</TableHead>
        <TableHead>Title</TableHead>
        <TableHead>Priority</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default WorkOrderTableHeader;
