
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { Vendor } from '../types/vendorTypes';
import { Mail, MapPin, Phone, FileText, Edit, Trash2, Eye } from 'lucide-react';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';

interface VendorTableRowProps {
  vendor: Vendor;
  onViewDetails: (vendor: Vendor) => void;
  onEditVendor: (vendor: Vendor) => void;
}

const VendorTableRow: React.FC<VendorTableRowProps> = ({ 
  vendor, 
  onViewDetails, 
  onEditVendor 
}) => {
  const navigate = useNavigate();

  // Handle view vendor details
  const handleViewVendor = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(vendor);
  };

  // Handle edit vendor
  const handleEditVendor = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditVendor(vendor);
  };

  // Handle row click
  const handleRowClick = () => {
    navigate(`/vendors/${vendor.vendorid}`);
  };

  // Format address for display
  const formatAddress = () => {
    const parts = [
      vendor.city,
      vendor.state,
      vendor.zip
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'No location information';
  };

  // Get vendor status color
  const getStatusColor = (status: string | undefined): StatusType => {
    if (!status) return 'neutral';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'neutral';
      case 'approved':
        return 'info';
      case 'potential':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  // Get action menu groups
  const getVendorActions = (): ActionGroup[] => {
    return [
      {
        // Primary actions
        items: [
          {
            label: 'View details',
            icon: <Eye className="h-4 w-4" />,
            onClick: handleViewVendor
          },
          {
            label: 'Edit vendor',
            icon: <Edit className="h-4 w-4" />,
            onClick: handleEditVendor
          }
        ]
      },
      {
        // Document actions
        items: [
          {
            label: 'View documents',
            icon: <FileText className="h-4 w-4" />,
            onClick: (e) => {
              e.stopPropagation();
              console.log('View documents action');
            }
          }
        ]
      },
      {
        // Destructive actions
        items: [
          {
            label: 'Delete vendor',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (e) => {
              e.stopPropagation();
              console.log('Delete vendor action');
            },
            className: 'text-red-600'
          }
        ]
      }
    ];
  };

  return (
    <TableRow onClick={handleRowClick} className="cursor-pointer hover:bg-[#0485ea]/5 transition-colors">
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{vendor.vendorname}</span>
          <span className="text-xs text-muted-foreground">{vendor.vendorid}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          {vendor.email && (
            <span className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {vendor.email}
            </span>
          )}
          {vendor.phone && (
            <span className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              {vendor.phone}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-start gap-1">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-sm">{formatAddress()}</span>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge 
          status={getStatusColor(vendor.status)} 
          label={vendor.status || 'Unknown'} 
        />
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end">
          <ActionMenu groups={getVendorActions()} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default VendorTableRow;
