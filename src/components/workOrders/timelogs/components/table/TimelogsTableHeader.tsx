
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const TimelogsTableHeader = () => {
  return (
    <TableHeader className="bg-[#0485ea]/10">
      <TableRow>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Date</TableHead>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Employee</TableHead>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Hours</TableHead>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Notes</TableHead>
        <TableHead className="text-right font-montserrat font-semibold text-[#0485ea]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TimelogsTableHeader;
