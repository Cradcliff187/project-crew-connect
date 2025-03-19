
import { Package, Eye, Edit, History, ListTree, Archive } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

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
}

// Map database status to StatusBadge component status
export const mapStatusToStatusBadge = (status: string | null): StatusType => {
  const statusMap: Record<string, StatusType> = {
    "active": "active",
    "inactive": "inactive",
    "qualified": "qualified",
    "pending": "pending",
    "new": "pending",
    "on_hold": "on-hold",
    "preferred": "qualified"
  };
  
  if (!status) return "unknown";
  
  const lowercaseStatus = status.toLowerCase();
  return statusMap[lowercaseStatus] || "unknown";
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(date);
};

const VendorsTable = ({ vendors, loading, error, searchQuery }: VendorsTableProps) => {
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
            onClick: (e) => console.log('View vendor details', vendor.vendorid)
          },
          {
            label: 'Edit vendor',
            icon: <Edit className="w-4 h-4" />,
            onClick: (e) => console.log('Edit vendor', vendor.vendorid)
          },
          {
            label: 'Order history',
            icon: <History className="w-4 h-4" />,
            onClick: (e) => console.log('Order history', vendor.vendorid)
          }
        ]
      },
      {
        items: [
          {
            label: 'Material catalog',
            icon: <ListTree className="w-4 h-4" />,
            onClick: (e) => console.log('Material catalog', vendor.vendorid)
          }
        ]
      },
      {
        items: [
          {
            label: 'Deactivate vendor',
            icon: <Archive className="w-4 h-4" />,
            onClick: (e) => console.log('Deactivate vendor', vendor.vendorid),
            className: 'text-red-600'
          }
        ]
      }
    ];
  };

  return (
    <div className="premium-card animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader>
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
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
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
            ))
          ) : error ? (
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
          ) : filteredVendors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No vendors found. Add your first vendor!</p>
              </TableCell>
            </TableRow>
          ) : (
            filteredVendors.map((vendor) => (
              <TableRow key={vendor.vendorid}>
                <TableCell>
                  <div className="font-medium">{vendor.vendorname || 'Unnamed Vendor'}</div>
                  <div className="text-xs text-muted-foreground">{vendor.vendorid}</div>
                </TableCell>
                <TableCell>
                  <div>{vendor.email || 'No Email'}</div>
                  <div className="text-xs text-muted-foreground">{vendor.phone || 'No Phone'}</div>
                </TableCell>
                <TableCell>
                  {vendor.city && vendor.state ? (
                    <div>{vendor.city}, {vendor.state}</div>
                  ) : (
                    <div className="text-muted-foreground">No Location</div>
                  )}
                </TableCell>
                <TableCell>{formatDate(vendor.createdon)}</TableCell>
                <TableCell>
                  <StatusBadge status={mapStatusToStatusBadge(vendor.status)} />
                </TableCell>
                <TableCell>
                  <ActionMenu groups={getVendorActions(vendor)} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VendorsTable;
