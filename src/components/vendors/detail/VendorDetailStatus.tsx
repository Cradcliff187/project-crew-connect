
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Vendor } from '../types/vendorTypes';
import VendorStatusControl from '../status/VendorStatusControl';
import StatusHistoryView from '@/components/common/status/StatusHistoryView';
import { getVendorStatusDisplay, getVendorStatusColor } from '../utils/vendorTransitions';
import { Badge } from '@/components/ui/badge';

interface VendorDetailStatusProps {
  vendor: Vendor;
  onStatusChange: () => void;
}

const VendorDetailStatus: React.FC<VendorDetailStatusProps> = ({ 
  vendor, 
  onStatusChange 
}) => {
  const currentStatus = vendor.status || 'POTENTIAL';
  
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
            <Badge className={`${getVendorStatusColor(currentStatus)}`}>
              {getVendorStatusDisplay(currentStatus)}
            </Badge>
            
            <div className="text-sm text-muted-foreground">
              {currentStatus === 'POTENTIAL' && (
                "This vendor is a potential supplier and needs to be approved before active use."
              )}
              {currentStatus === 'APPROVED' && (
                "This vendor has been approved and can be assigned to projects."
              )}
              {currentStatus === 'ACTIVE' && (
                "This vendor is currently active and available for new orders."
              )}
              {currentStatus === 'INACTIVE' && (
                "This vendor is currently inactive and not available for new orders."
              )}
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
