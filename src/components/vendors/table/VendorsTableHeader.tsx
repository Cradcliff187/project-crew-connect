
import { TableHead } from '@/components/ui/table';
import { Building2 } from 'lucide-react';

const VendorsTableHeader = () => {
  return (
    <>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">
        <div className="flex items-center gap-1">
          <Building2 className="h-4 w-4" />
          <span>Vendor</span>
        </div>
      </TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Contact</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Location</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Payment Terms</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Status</TableHead>
      <TableHead className="text-right font-montserrat font-semibold text-[#0485ea]">Actions</TableHead>
    </>
  );
};

export default VendorsTableHeader;
