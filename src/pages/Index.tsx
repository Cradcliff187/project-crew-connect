import React from 'react';
import PageTransition from '@/components/layout/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, CheckCircle, ClipboardList, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  // Fetch summary counts
  const { data: counts = { projects: 0, workOrders: 0, vendors: 0, invoices: 0 }, isLoading } =
    useQuery({
      queryKey: ['dashboard-counts'],
      queryFn: async () => {
        try {
          const [projectsResponse, workOrdersResponse, vendorsResponse] = await Promise.all([
            supabase.from('projects').select('projectid', { count: 'exact', head: true }),
            supabase
              .from('maintenance_work_orders')
              .select('work_order_id', { count: 'exact', head: true }),
            supabase.from('vendors').select('vendorid', { count: 'exact', head: true }),
          ]);

          return {
            projects: projectsResponse.count || 0,
            workOrders: workOrdersResponse.count || 0,
            vendors: vendorsResponse.count || 0,
            invoices: 0, // Placeholder for future invoice system
          };
        } catch (error) {
          console.error('Error fetching dashboard counts:', error);
          return { projects: 0, workOrders: 0, vendors: 0, invoices: 0 };
        }
      },
    });

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome to the AKC LLC management dashboard.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Active Projects"
            value={isLoading ? '...' : counts.projects.toString()}
            icon={<ClipboardList className="h-4 w-4 text-[#0485ea]" />}
            description="Total active projects"
          />

          <DashboardCard
            title="Work Orders"
            value={isLoading ? '...' : counts.workOrders.toString()}
            icon={<CheckCircle className="h-4 w-4 text-[#0485ea]" />}
            description="Pending work orders"
          />

          <DashboardCard
            title="Vendors"
            value={isLoading ? '...' : counts.vendors.toString()}
            icon={<CalendarDays className="h-4 w-4 text-[#0485ea]" />}
            description="Approved vendors"
          />

          <DashboardCard
            title="Invoices"
            value={isLoading ? '...' : counts.invoices.toString()}
            icon={<DollarSign className="h-4 w-4 text-[#0485ea]" />}
            description="Pending payments"
          />
        </div>
      </div>
    </PageTransition>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

const DashboardCard = ({ title, value, icon, description }: DashboardCardProps) => {
  return (
    <Card className="bg-white hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground pt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
