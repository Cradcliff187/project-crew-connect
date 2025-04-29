import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Vendor } from '../types/vendorTypes';
import VendorStatusControl from '../status/VendorStatusControl';
import StatusHistoryView from '@/components/common/status/StatusHistoryView';
import StatusBadge from '@/components/common/status/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { getStatusColorClass, getStatusDisplayName } from '@/utils/statusTransitions';
import { supabase } from '@/integrations/supabase/client';
import { useStatusOptions } from '@/hooks/useStatusOptions';

interface VendorDetailStatusProps {
  vendor: Vendor;
  onStatusChange: () => void;
}

const VendorDetailStatus: React.FC<VendorDetailStatusProps> = ({ vendor, onStatusChange }) => {
  const [history, setHistory] = useState<any[]>([]);
  const currentStatus = vendor.status || 'POTENTIAL';
  const { statusOptions } = useStatusOptions('VENDOR', currentStatus);

  useEffect(() => {
    if (vendor.vendorid) {
      fetchHistory();
    }
  }, [vendor.vendorid]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('activitylog')
        .select('*')
        .eq('referenceid', vendor.vendorid)
        .eq('moduletype', 'VENDOR')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Transform the data to match our expected format
      const formattedHistory =
        data?.map(item => ({
          status: item.status,
          previous_status: item.previousstatus,
          changed_date: item.timestamp,
          changed_by: item.useremail,
          notes: item.detailsjson || item.action,
        })) || [];

      setHistory(formattedHistory);
    } catch (error: any) {
      console.error('Error fetching status history:', error);
      setHistory([]);
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'active':
        return 'This vendor is currently approved and can be used for purchases and expenses.';
      case 'pending':
        return 'This vendor is being evaluated as a potential vendor for your company.';
      case 'inactive':
        return 'This vendor is no longer approved for use.';
      default:
        return 'Status unknown';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-lg">Vendor Status</CardTitle>
          <VendorStatusControl
            vendor={vendor}
            onStatusChange={() => {
              onStatusChange();
              fetchHistory();
            }}
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <StatusBadge status={currentStatus.toLowerCase()} />
            <div className="text-sm text-muted-foreground">
              {getStatusDescription(currentStatus)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusHistoryView
            history={history}
            statusOptions={statusOptions}
            currentStatus={currentStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDetailStatus;
