import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import useVendorAssociatedData from '../hooks/useVendorAssociatedData';

interface VendorMetricsProps {
  vendorId: string;
}

const VendorMetrics: React.FC<VendorMetricsProps> = ({ vendorId }) => {
  const { projects, workOrders, loadingAssociations, fetchAssociatedData } =
    useVendorAssociatedData();
  const navigate = useNavigate();

  useEffect(() => {
    if (vendorId) {
      fetchAssociatedData(vendorId);
    }
  }, [vendorId, fetchAssociatedData]);

  const navigateToProjects = () => {
    navigate('/projects');
  };

  const navigateToWorkOrders = () => {
    navigate('/work-orders');
  };

  return (
    <Card className="shadow-sm transition hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0485ea]">
          <BriefcaseBusiness className="h-5 w-5" />
          Vendor Associations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingAssociations ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{projects.length + workOrders.length}</span>
              <span className="text-sm text-muted-foreground">Total Associated Items</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-[#0485ea] text-[#0485ea] hover:bg-[#0485ea] hover:text-white"
                onClick={navigateToProjects}
              >
                Projects ({projects.length})
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#0485ea] text-[#0485ea] hover:bg-[#0485ea] hover:text-white"
                onClick={navigateToWorkOrders}
              >
                Work Orders ({workOrders.length})
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorMetrics;
