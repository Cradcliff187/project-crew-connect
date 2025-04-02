
import React from 'react';
import { Vendor } from '../types/vendorTypes';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import UniversalStatusControl from '@/components/common/status/UniversalStatusControl';

interface VendorStatusControlProps {
  vendor: Vendor;
  onStatusChange: () => void;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

const VendorStatusControl: React.FC<VendorStatusControlProps> = ({ 
  vendor, 
  onStatusChange,
  size = 'md', // Changed from 'default' to 'md' to match allowed values
  showBadge = true
}) => {
  const { statusOptions } = useStatusOptions('VENDOR', vendor.status);
  
  return (
    <UniversalStatusControl 
      entityId={vendor.vendorid}
      entityType="VENDOR"
      currentStatus={vendor.status || 'POTENTIAL'}
      statusOptions={statusOptions}
      tableName="vendors"
      idField="vendorid"
      onStatusChange={onStatusChange}
      recordHistory={true}
      size={size}
      showStatusBadge={showBadge}
    />
  );
};

export default VendorStatusControl;
