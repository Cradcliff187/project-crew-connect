
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Vendor } from '../types/vendorTypes';
import VendorStatusControl from '../status/VendorStatusControl';
import StatusHistoryView from '@/components/common/status/StatusHistoryView';
import { Badge } from '@/components/ui/badge';
import { getStatusColorClass, getStatusDisplayName } from '@/utils/statusTransitions';

interface VendorDetailStatusProps {
  vendor: Vendor;
  onStatusChange: () => void;
}

const VendorDetailStatus: React.FC<VendorDetailStatusProps> = ({ 
  vendor, 
  onStatusChange 
}) => {
  const currentStatus = vendor.status || 'POTENTIAL';
  
  // Status descriptions for each vendor status
  const getStatusDescription = (status: string): string => {
    switch (status) {
      case 'POTENTIAL':
        return "This vendor is a potential supplier and needs to be approved before active use.";
      case 'APPROVED':
        return "This vendor has been approved and can be assigned to projects.";
      case 'ACTIVE':
        return "This vendor is currently active and available for new orders.";
      case 'INACTIVE':
        return "This vendor is currently inactive and not available for new orders.";
      default:
        return "Status information not available.";
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-lg">Vendor Status</CardTitle>
          <VendorStatusControl 
            vendor={vendor} 
            onStatusChange={onStatusChange} 
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColorClass('VENDOR', currentStatus)}>
              {getStatusDisplayName('VENDOR', currentStatus)}
            </Badge>
            
            <div className="text-sm text-muted-foreground">
              {getStatusDescription(currentStatus)}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <StatusHistoryView 
        entityId={vendor.vendorid}
        entityType="VENDOR"
      />
    </div>
  );
};

export default VendorDetailStatus;
