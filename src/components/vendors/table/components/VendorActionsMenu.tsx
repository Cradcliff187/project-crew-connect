import React from 'react';
import { Mail, MapPin, Phone, Edit, Trash2, Eye } from 'lucide-react';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Vendor } from '../../types/vendorTypes';

interface VendorActionsMenuProps {
  vendor: Vendor;
  onViewDetails: (vendor: Vendor) => void;
  onEditVendor: (vendor: Vendor) => void;
}

const VendorActionsMenu = ({ vendor, onViewDetails, onEditVendor }: VendorActionsMenuProps) => {
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

  // Get standardized action menu groups
  const getVendorActions = (): ActionGroup[] => {
    return [
      {
        // Primary actions
        items: [
          {
            label: 'View details',
            icon: <Eye className="h-4 w-4" />,
            onClick: handleViewVendor,
          },
          {
            label: 'Edit vendor',
            icon: <Edit className="h-4 w-4" />,
            onClick: handleEditVendor,
          },
        ],
      },
      {
        // Contact actions
        items: [
          {
            label: 'Call vendor',
            icon: <Phone className="h-4 w-4" />,
            onClick: handleCallVendor,
            disabled: !vendor.phone,
          },
          {
            label: 'Email vendor',
            icon: <Mail className="h-4 w-4" />,
            onClick: handleEmailVendor,
            disabled: !vendor.email,
          },
        ],
      },
      {
        // Destructive actions
        items: [
          {
            label: 'Delete vendor',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: handleDeleteVendor,
            className: 'text-red-600',
          },
        ],
      },
    ];
  };

  return (
    <div className="flex justify-end">
      <ActionMenu groups={getVendorActions()} />
    </div>
  );
};

export default VendorActionsMenu;
