
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MaterialsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[40%]">Material</TableHead>
        <TableHead className="w-[15%]">Quantity</TableHead>
        <TableHead className="w-[15%]">Unit Price</TableHead>
        <TableHead className="w-[15%]">Total</TableHead>
        <TableHead className="w-[15%] text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MaterialsTableHeader;
