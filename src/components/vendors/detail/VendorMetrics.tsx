
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BriefcaseBusiness, Folder, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import useVendorAssociatedData from '../hooks/useVendorAssociatedData';

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
            <Folder className="h-5 w-5" />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAssociations ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-3xl font-bold">{projects.length}</span>
                <span className="text-sm text-muted-foreground">
                  Associated Projects
                </span>
              </div>
              {projects.length > 0 ? (
                <Button 
                  variant="outline" 
                  className="w-full border-[#0485ea] text-[#0485ea] hover:bg-[#0485ea] hover:text-white"
                  onClick={navigateToProjects}
                >
                  View All Projects
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground py-2">
                  No projects are currently associated with this vendor.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="transition hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0485ea]">
            <Wrench className="h-5 w-5" />
            Work Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAssociations ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-3xl font-bold">{workOrders.length}</span>
                <span className="text-sm text-muted-foreground">
                  Associated Work Orders
                </span>
              </div>
              {workOrders.length > 0 ? (
                <Button 
                  variant="outline" 
                  className="w-full border-[#0485ea] text-[#0485ea] hover:bg-[#0485ea] hover:text-white"
                  onClick={navigateToWorkOrders}
                >
                  View All Work Orders
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground py-2">
                  No work orders are currently associated with this vendor.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorMetrics;
