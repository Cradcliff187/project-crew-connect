
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

const MaterialsTableHeader = () => {
  return (
    <TableHeader className="bg-[#0485ea]/10">
      <TableRow>
        <TableHead className="font-semibold text-[#0485ea]">Material</TableHead>
        <TableHead className="font-semibold text-[#0485ea]">Vendor</TableHead>
        <TableHead className="font-semibold text-[#0485ea]">Quantity</TableHead>
        <TableHead className="font-semibold text-[#0485ea]">Unit Price</TableHead>
        <TableHead className="font-semibold text-[#0485ea]">Total</TableHead>
        <TableHead className="text-right font-semibold text-[#0485ea]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MaterialsTableHeader;
