
import React from 'react';
import { Vendor } from '../types/vendorTypes';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import UniversalStatusControl from '@/components/common/status/UniversalStatusControl';

interface VendorStatusControlProps {
  vendor: Vendor;
  onStatusChange: () => void;
}

const VendorStatusControl: React.FC<VendorStatusControlProps> = ({ 
  vendor, 
  onStatusChange 
}) => {
  const currentStatus = vendor.status || 'POTENTIAL';
  const { statusOptions } = useStatusOptions('VENDOR', currentStatus);
  
  // Filter status options to only show relevant transitions for vendors
  const vendorStatusOptions = statusOptions.filter(option => 
    ['POTENTIAL', 'APPROVED', 'ACTIVE', 'INACTIVE'].includes(option.value)
  );
  
  return (
    <div className="flex items-center relative z-10">
      <UniversalStatusControl 
        entityId={vendor.vendorid}
        entityType="VENDOR"
        currentStatus={currentStatus}
        statusOptions={vendorStatusOptions}
        tableName="vendors"
        idField="vendorid"
        onStatusChange={onStatusChange}
        additionalUpdateFields={{
          updated_at: new Date().toISOString()
        }}
        showStatusBadge={true}
        size="sm"
      />
    </div>
  );
};

export default VendorStatusControl;
