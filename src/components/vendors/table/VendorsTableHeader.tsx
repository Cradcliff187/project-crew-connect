
import { TableHead } from '@/components/ui/table';
import { Building2, Mail, MapPin, BarChart } from 'lucide-react';

const VendorsTableHeader = () => {
  return (
    <>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">
        <div className="flex items-center gap-1">
          <Building2 className="h-4 w-4" />
          <span>Vendor</span>
        </div>
      </TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">
        <div className="flex items-center gap-1">
          <Mail className="h-4 w-4" />
          <span>Contact</span>
        </div>
      </TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>Location</span>
        </div>
      </TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">
        <div className="flex items-center gap-1">
          <BarChart className="h-4 w-4" />
          <span>Status</span>
        </div>
      </TableHead>
      <TableHead className="text-right font-montserrat font-semibold text-[#0485ea]">Actions</TableHead>
    </>
  );
};

export default VendorsTableHeader;
