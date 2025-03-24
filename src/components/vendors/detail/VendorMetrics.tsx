
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import useVendorAssociatedData from '../hooks/useVendorAssociatedData';
import AssociatedProjects from './AssociatedProjects';
import AssociatedWorkOrders from './AssociatedWorkOrders';

interface VendorMetricsProps {
  vendorId: string;
}

const VendorMetrics: React.FC<VendorMetricsProps> = ({ vendorId }) => {
  const { 
    projects, 
    workOrders, 
    loadingAssociations, 
    fetchAssociatedData 
  } = useVendorAssociatedData();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssociatedData(vendorId);
  }, [vendorId]);

  const navigateToProjects = () => {
    navigate('/projects');
  };

  const navigateToWorkOrders = () => {
    navigate('/work-orders');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="transition hover:shadow-md">
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
                <span className="text-sm text-muted-foreground">
                  Total Associated Items
                </span>
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

      <div className="md:hidden">
        <Card className="transition hover:shadow-md">
          <CardContent className="pt-6">
            <AssociatedProjects 
              projects={projects} 
              loading={loadingAssociations}
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden">
        <Card className="transition hover:shadow-md">
          <CardContent className="pt-6">
            <AssociatedWorkOrders 
              workOrders={workOrders} 
              loading={loadingAssociations}
            />
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:block">
        <Card className="transition hover:shadow-md">
          <CardContent className="pt-6">
            <AssociatedProjects 
              projects={projects} 
              loading={loadingAssociations}
            />
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:block">
        <Card className="transition hover:shadow-md">
          <CardContent className="pt-6">
            <AssociatedWorkOrders 
              workOrders={workOrders} 
              loading={loadingAssociations}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorMetrics;
