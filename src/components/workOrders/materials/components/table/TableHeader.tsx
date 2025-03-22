
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MaterialsTableHeader = () => {
  return (
    <TableHeader className="bg-[#0485ea]/10">
      <TableRow>
        <TableHead className="w-[40%] font-semibold text-[#0485ea]">Material</TableHead>
        <TableHead className="w-[15%] font-semibold text-[#0485ea]">Quantity</TableHead>
        <TableHead className="w-[15%] font-semibold text-[#0485ea]">Unit Price</TableHead>
        <TableHead className="w-[15%] font-semibold text-[#0485ea]">Total</TableHead>
        <TableHead className="w-[15%] text-right font-semibold text-[#0485ea]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default MaterialsTableHeader;
