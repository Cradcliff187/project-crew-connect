
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

const EstimateTableHeader = () => {
  return (
    <TableHeader className="bg-[#0485ea]/10">
      <TableRow>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Estimate #</TableHead>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Client</TableHead>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Project</TableHead>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Date</TableHead>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Amount</TableHead>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Status</TableHead>
        <TableHead className="text-right font-montserrat font-semibold text-[#0485ea]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default EstimateTableHeader;
