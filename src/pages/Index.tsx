import { BarChart3, Briefcase, FileText, Users, DollarSign, Clock, ArrowRight, TrendingUp, CheckCircle, Wrench, Calendar, AlertTriangle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardCard from '@/components/dashboard/DashboardCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import PageTransition from '@/components/layout/PageTransition';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkData } from '@/components/activeWork/hooks/useActiveWorkData';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardMetrics } from '@/components/dashboard/hooks/useDashboardMetrics';
import { useRecentActivity } from '@/components/dashboard/hooks/useRecentActivity';
import DashboardBudgetChart from '@/components/dashboard/DashboardBudgetChart';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';

const Dashboard = () => {
  const navigate = useNavigate();
  const { projectItems, workOrderItems, projectsLoading, workOrdersLoading } = useActiveWorkData(5);
  const { metrics, metricsLoading } = useDashboardMetrics();
  const { activities, activitiesLoading } = useRecentActivity();

  const renderProjectItem = (project: any, index: number) => (
    <div key={index} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">{project.title}</span>
        <StatusBadge status={project.status} size="sm" />
      </div>
      <div className="flex space-x-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{project.dueDate ? formatDate(project.dueDate) : 'No due date'}</span>
      </div>
      <div className="flex space-x-3 items-center">
        <Progress value={project.progress} className="h-2" />
        <span className="text-sm text-muted-foreground w-10">{project.progress}%</span>
      </div>
    </div>
  );

  const renderWorkOrderItem = (workOrder: any, index: number) => (
    <div key={index} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium">{workOrder.title}</span>
        <StatusBadge status={workOrder.status} size="sm" />
      </div>
      <div className="flex space-x-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{workOrder.dueDate ? formatDate(workOrder.dueDate) : 'Not scheduled'}</span>
      </div>
      <div className="flex space-x-3 items-center">
        <Progress value={workOrder.progress} className="h-2" />
        <span className="text-sm text-muted-foreground w-10">{workOrder.progress}%</span>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <div className="flex flex-col gap-2 mb-6 animate-in">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your construction management activities
          </p>
        </div>
        
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
          <Card className="premium-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {metricsLoading ? (
                      <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                    ) : (
                      metrics.activeProjects
                    )}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-construction-50 rounded-full flex items-center justify-center text-construction-600">
                  <Briefcase className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center mt-3 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+8%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="premium-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Estimates</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {metricsLoading ? (
                      <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                    ) : (
                      metrics.pendingEstimates
                    )}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center mt-3 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+12%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="premium-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {metricsLoading ? (
                      <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    ) : (
                      formatCurrency(metrics.totalRevenue)
                    )}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center mt-3 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+15%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="premium-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Contacts</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {metricsLoading ? (
                      <div className="h-8 w-12 bg-muted animate-pulse rounded" />
                    ) : (
                      metrics.activeContacts
                    )}
                  </h3>
                </div>
                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center mt-3 text-sm">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">+5%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Actionable Insights Section */}
        <div className="mb-6 animate-in" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-lg font-semibold mb-4">Actionable Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <UpcomingTasks />
            
            <DashboardCard
              title="Budget Alerts"
              icon={<AlertTriangle className="h-5 w-5" />}
            >
              <div className="space-y-3">
                {metricsLoading ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="flex justify-between items-center border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <div className="h-5 bg-muted rounded w-40 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                      </div>
                      <div className="h-6 bg-muted rounded w-16 animate-pulse" />
                    </div>
                  ))
                ) : metrics.budgetAlerts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No budget alerts</p>
                  </div>
                ) : (
                  metrics.budgetAlerts.map((alert, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{alert.projectName}</p>
                        <p className="text-xs text-muted-foreground">Budget: {formatCurrency(alert.budget)}</p>
                      </div>
                      <StatusBadge 
                        status={alertCount > 0 ? 'warning' as StatusType : 'critical' as StatusType}
                        size="sm"
                      />
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-3 border-t">
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/projects')}>
                  View All Projects
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </DashboardCard>
            
            <DashboardCard
              title="Quick Actions"
              icon={<Bell className="h-5 w-5" />}
            >
              <div className="grid grid-cols-2 gap-3">
                <Button className="w-full bg-[#0485ea] hover:bg-[#0375d1]" onClick={() => navigate('/projects/new')}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  New Project
                </Button>
                <Button className="w-full bg-[#0485ea] hover:bg-[#0375d1]" onClick={() => navigate('/work-orders/new')}>
                  <Wrench className="h-4 w-4 mr-2" />
                  New Work Order
                </Button>
                <Button className="w-full bg-[#0485ea] hover:bg-[#0375d1]" onClick={() => navigate('/estimates/new')}>
                  <FileText className="h-4 w-4 mr-2" />
                  New Estimate
                </Button>
                <Button className="w-full bg-[#0485ea] hover:bg-[#0375d1]" onClick={() => navigate('/contacts/new')}>
                  <Users className="h-4 w-4 mr-2" />
                  New Contact
                </Button>
              </div>
            </DashboardCard>
          </div>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in" style={{ animationDelay: '0.2s' }}>
          <div className="lg:col-span-2 space-y-6">
            {/* Active Projects */}
            <DashboardCard
              title="Active Projects"
              icon={<Briefcase className="h-5 w-5" />}
              footer={
                <Button 
                  variant="ghost" 
                  className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center"
                  onClick={() => navigate('/active-work?tab=projects')}
                >
                  View All Projects
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              }
            >
              <div className="space-y-5">
                {projectsLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-5 bg-muted rounded w-1/3 animate-pulse"></div>
                        <div className="h-5 bg-muted rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                      <div className="flex space-x-3 items-center">
                        <div className="h-2 bg-muted rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-10 animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : projectItems.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No active projects</p>
                  </div>
                ) : (
                  projectItems.map(renderProjectItem)
                )}
              </div>
            </DashboardCard>

            {/* Active Work Orders */}
            <DashboardCard
              title="Active Work Orders"
              icon={<Wrench className="h-5 w-5" />}
              footer={
                <Button 
                  variant="ghost" 
                  className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center"
                  onClick={() => navigate('/active-work?tab=workOrders')}
                >
                  View All Work Orders
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              }
            >
              <div className="space-y-5">
                {workOrdersLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-5 bg-muted rounded w-1/3 animate-pulse"></div>
                        <div className="h-5 bg-muted rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                      <div className="flex space-x-3 items-center">
                        <div className="h-2 bg-muted rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-10 animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : workOrderItems.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No active work orders</p>
                  </div>
                ) : (
                  workOrderItems.map(renderWorkOrderItem)
                )}
              </div>
            </DashboardCard>
          </div>
          
          <div className="space-y-6">
            <DashboardBudgetChart />
            
            <DashboardCard
              title="Recent Activity"
              icon={<Clock className="h-5 w-5" />}
            >
              <div className="space-y-3 text-sm">
                {activitiesLoading ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="flex items-start gap-2 pb-3 border-b border-border/50">
                      <div className="h-7 w-7 rounded-full bg-muted animate-pulse mt-0.5"></div>
                      <div className="space-y-1 flex-1">
                        <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-muted rounded w-1/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : activities.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No recent activity</p>
                  </div>
                ) : (
                  activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-2 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                      <div className={`h-7 w-7 rounded-full ${activity.iconBg} flex items-center justify-center ${activity.iconColor} mt-0.5`}>
                        {activity.icon}
                      </div>
                      <div>
                        <p dangerouslySetInnerHTML={{ __html: activity.content }}></p>
                        <p className="text-muted-foreground text-xs mt-1">{activity.timeAgo}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
