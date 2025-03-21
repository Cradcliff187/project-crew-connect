
import { Package, Eye, Edit, History, ListTree, Archive } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { formatDate, mapStatusToStatusBadge } from './utils/vendorUtils';
import VendorInfo from './row/VendorInfo';
import VendorContactInfo from './row/VendorContactInfo';
import VendorLocation from './row/VendorLocation';

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

interface VendorsTableProps {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onViewDetails: (vendor: Vendor) => void;
  onEditVendor: (vendor: Vendor) => void;
}

const VendorsTable = ({ vendors, loading, error, searchQuery, onViewDetails, onEditVendor }: VendorsTableProps) => {
  // Filter vendors based on search query
  const filteredVendors = vendors.filter(vendor => 
    (vendor.vendorname?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (vendor.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (vendor.vendorid?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );
  
  const getVendorActions = (vendor: Vendor): ActionGroup[] => {
    return [
      {
        items: [
          {
            label: 'View details',
            icon: <Eye className="w-4 h-4" />,
            onClick: (e) => {
              e.stopPropagation();
              onViewDetails(vendor);
            }
          },
          {
            label: 'Edit vendor',
            icon: <Edit className="w-4 h-4" />,
            onClick: (e) => {
              e.stopPropagation();
              onEditVendor(vendor);
            }
          },
          {
            label: 'Order history',
            icon: <History className="w-4 h-4" />,
            onClick: (e) => {
              e.stopPropagation();
              console.log('Order history', vendor.vendorid);
            }
          }
        ]
      },
      {
        items: [
          {
            label: 'Material catalog',
            icon: <ListTree className="w-4 h-4" />,
            onClick: (e) => {
              e.stopPropagation();
              console.log('Material catalog', vendor.vendorid);
            }
          }
        ]
      },
      {
        items: [
          {
            label: 'Deactivate vendor',
            icon: <Archive className="w-4 h-4" />,
            onClick: (e) => {
              e.stopPropagation();
              console.log('Deactivate vendor', vendor.vendorid);
            },
            className: 'text-red-600'
          }
        ]
      }
    ];
  };

  const handleRowClick = (vendor: Vendor) => {
    onViewDetails(vendor);
  };

  // Table loading skeleton
  if (loading) {
    return (
      <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-red-500">
                <p>Error loading vendors: {error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state
  if (filteredVendors.length === 0) {
    return (
      <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No vendors found. Add your first vendor!</p>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // Data loaded with results
  return (
    <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Vendor</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Added</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredVendors.map((vendor) => (
            <TableRow 
              key={vendor.vendorid}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleRowClick(vendor)}
            >
              <TableCell>
                <VendorInfo vendor={vendor} />
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
              <TableCell>
                <ActionMenu groups={getVendorActions(vendor)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VendorsTable;
