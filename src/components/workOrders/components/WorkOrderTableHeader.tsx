
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

const WorkOrderTableHeader = () => {
  return (
    <TableHeader className="bg-[#0485ea]/10">
      <TableRow>
        <TableHead className="font-semibold text-[#0485ea]">WO Number</TableHead>
        <TableHead className="font-semibold text-[#0485ea]">PO Number</TableHead>
        <TableHead className="font-semibold text-[#0485ea]">Due Date</TableHead>
        <TableHead className="font-semibold text-[#0485ea]">Priority</TableHead>
        <TableHead className="font-semibold text-[#0485ea]">Status</TableHead>
        <TableHead className="text-right font-semibold text-[#0485ea]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default WorkOrderTableHeader;
