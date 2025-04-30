import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

const EstimateTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Estimate #</TableHead>
        <TableHead>Client</TableHead>
        <TableHead>Project</TableHead>
        <TableHead>Last Updated</TableHead>
        <TableHead>Latest Amount</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default EstimateTableHeader;
