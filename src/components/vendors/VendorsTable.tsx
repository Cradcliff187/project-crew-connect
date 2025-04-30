import { Table, TableBody } from '@/components/ui/table';
import VendorsTableHeader from './table/VendorsTableHeader';
import VendorsTableBody from './table/VendorsTableBody';
import VendorsLoadingState from './table/VendorsLoadingState';
import VendorsErrorState from './table/VendorsErrorState';
import VendorsEmptyState from './table/VendorsEmptyState';
import { Vendor } from './types/vendorTypes';

interface VendorsTableProps {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onViewDetails: (vendor: Vendor) => void;
  onEditVendor: (vendor: Vendor) => void;
}

const VendorsTable = ({
  vendors,
  loading,
  error,
  searchQuery,
  onViewDetails,
  onEditVendor,
}: VendorsTableProps) => {
  // Filter vendors based on search query
  const filteredVendors = vendors.filter(
    vendor =>
      (vendor.vendorname?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (vendor.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (vendor.vendorid?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <VendorsLoadingState />;
  }

  if (error) {
    return <VendorsErrorState error={error} />;
  }

  if (filteredVendors.length === 0) {
    return <VendorsEmptyState searchQuery={searchQuery} />;
  }

  return (
    <Table className="border rounded-md">
      <VendorsTableHeader />
      <TableBody>
        <VendorsTableBody
          vendors={filteredVendors}
          onViewDetails={onViewDetails}
          onEditVendor={onEditVendor}
        />
      </TableBody>
    </Table>
  );
};

export default VendorsTable;
