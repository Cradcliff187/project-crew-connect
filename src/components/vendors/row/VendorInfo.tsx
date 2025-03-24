
import React from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDocumentCount } from '@/hooks/useDocumentCount';
import { Vendor } from '../table/VendorTableRow';

interface VendorInfoProps {
  vendor: Vendor;
}

const VendorInfo = ({ vendor }: VendorInfoProps) => {
  const { count, loading } = useDocumentCount('VENDOR', vendor.vendorid);
  
  return (
    <div className="flex flex-col">
      <div className="font-medium text-[#0485ea]">{vendor.vendorname || 'Unnamed Vendor'}</div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground">{vendor.vendorid}</div>
        {count > 0 && (
          <Badge variant="outline" className="text-xs flex items-center gap-1 h-5 whitespace-nowrap">
            <FileText className="h-3 w-3" />
            {loading ? '...' : count} docs
          </Badge>
        )}
      </div>
    </div>
  );
};

export default VendorInfo;
