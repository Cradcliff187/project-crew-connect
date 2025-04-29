import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Mail, MapPin, BarChart } from 'lucide-react';

const VendorsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Vendor</TableHead>
        <TableHead>Contact</TableHead>
        <TableHead>Location</TableHead>
        <TableHead className="text-center">Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default VendorsTableHeader;
