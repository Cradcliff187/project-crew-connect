
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { Vendor } from '../types/vendorTypes';
import { Mail, MapPin, Phone, Edit, Trash2, Eye } from 'lucide-react';
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

  // Handle call vendor
  const handleCallVendor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vendor.phone) {
      window.location.href = `tel:${vendor.phone}`;
    }
  };

  // Handle email vendor
  const handleEmailVendor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vendor.email) {
      window.location.href = `mailto:${vendor.email}`;
    }
  };

  // Handle delete vendor
  const handleDeleteVendor = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Delete vendor action');
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

  // Get standardized action menu groups
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
        // Contact actions
        items: [
          {
            label: 'Call vendor',
            icon: <Phone className="h-4 w-4" />,
            onClick: handleCallVendor,
            disabled: !vendor.phone
          },
          {
            label: 'Email vendor',
            icon: <Mail className="h-4 w-4" />,
            onClick: handleEmailVendor,
            disabled: !vendor.email
          }
        ]
      },
      {
        // Destructive actions
        items: [
          {
            label: 'Delete vendor',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: handleDeleteVendor,
            className: 'text-red-600'
          }
        ]
      }
    ];
  };

  return (
    <TableRow onClick={handleRowClick} className="cursor-pointer hover:bg-[#0485ea]/5 transition-colors">
      <TableCell className="py-3">
        <div className="flex flex-col">
          <span className="font-medium">{vendor.vendorname}</span>
          <span className="text-xs text-muted-foreground">{vendor.vendorid}</span>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex flex-col gap-1">
          {vendor.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{vendor.email}</span>
            </div>
          )}
          {vendor.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">{vendor.phone}</span>
            </div>
          )}
          {!vendor.email && !vendor.phone && (
            <div className="text-xs text-muted-foreground">No contact information</div>
          )}
        </div>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-sm">{formatAddress()}</span>
        </div>
      </TableCell>
      <TableCell className="py-3 text-center">
        <div className="flex justify-center">
          <StatusBadge 
            status={getStatusColor(vendor.status)} 
            label={vendor.status || 'Unknown'} 
          />
        </div>
      </TableCell>
      <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end">
          <ActionMenu groups={getVendorActions()} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default VendorTableRow;
