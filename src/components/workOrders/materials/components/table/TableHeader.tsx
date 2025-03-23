
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

const MaterialsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Material</TableHead>
        <TableHead>Vendor</TableHead>
        <TableHead>Quantity</TableHead>
        <TableHead>Unit Price</TableHead>
        <TableHead>Total</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MaterialsTableHeader;
