import { TableHead } from '@/components/ui/table';
import { Building2, Mail, MapPin, BarChart } from 'lucide-react';

const VendorsTableHeader = () => {
  return (
    <>
      <TableHead className="font-montserrat font-semibold text-[#0485ea] w-1/4">
        <div className="flex items-center gap-1">
          <Building2 className="h-4 w-4" />
          <span>Vendor</span>
        </div>
      </TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea] w-1/4">
        <div className="flex items-center gap-1">
          <Mail className="h-4 w-4" />
          <span>Contact</span>
        </div>
      </TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea] w-1/4">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>Location</span>
        </div>
      </TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea] text-center w-1/8">
        <div className="flex items-center gap-1 justify-center">
          <BarChart className="h-4 w-4" />
          <span>Status</span>
        </div>
      </TableHead>
      <TableHead className="text-right font-montserrat font-semibold text-[#0485ea] w-1/8">
        Actions
      </TableHead>
    </>
  );
};

export default VendorsTableHeader;
