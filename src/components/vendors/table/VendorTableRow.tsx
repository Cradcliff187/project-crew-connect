
import { TableRow, TableCell } from '@/components/ui/table';
import { Package, Eye, Edit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import { formatDate, mapStatusToStatusBadge } from '../utils/vendorUtils';
import VendorInfo from '../row/VendorInfo';
import VendorContactInfo from '../row/VendorContactInfo';
import VendorLocation from '../row/VendorLocation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define vendor type based on our database schema
export interface Vendor {
  vendorid: string;
  vendorname: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: string | null;
  createdon: string | null;
  payment_terms: string | null;
  tax_id: string | null;
  notes: string | null;
}

interface VendorTableRowProps {
  vendor: Vendor;
  onViewDetails: (vendor: Vendor) => void;
  onEditVendor: (vendor: Vendor) => void;
}

const VendorTableRow = ({ 
  vendor, 
  onViewDetails,
  onEditVendor
}: VendorTableRowProps) => {
  return (
    <TableRow 
      key={vendor.vendorid}
      className="hover:bg-[#0485ea]/5 transition-colors"
    >
      <TableCell>
        <Link to={`/vendors/${vendor.vendorid}`} className="text-[#0485ea] hover:underline">
          {vendor.vendorname || 'Unnamed Vendor'}
        </Link>
      </TableCell>
      <TableCell>
        <VendorContactInfo vendor={vendor} />
      </TableCell>
      <TableCell>
        <VendorLocation vendor={vendor} />
      </TableCell>
      <TableCell>{formatDate(vendor.createdon)}</TableCell>
      <TableCell>
        <StatusBadge status={mapStatusToStatusBadge(vendor.status)} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(vendor)}
            className="text-[#0485ea] hover:bg-[#0485ea]/10"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-md">
              <DropdownMenuItem onClick={() => onViewDetails(vendor)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditVendor(vendor)}>
                Edit Vendor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default VendorTableRow;
