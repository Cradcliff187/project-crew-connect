
import { TableHead } from '@/components/ui/table';

const VendorsTableHeader = () => {
  return (
    <>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Vendor</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Contact</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Location</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Added</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Status</TableHead>
      <TableHead className="text-right font-montserrat font-semibold text-[#0485ea]">Actions</TableHead>
    </>
  );
};

export default VendorsTableHeader;
