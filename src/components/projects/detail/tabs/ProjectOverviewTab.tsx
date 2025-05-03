import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, MoreVertical, Calendar, DollarSign, Activity, User } from 'lucide-react';
import StatusBadge from '@/components/common/status/StatusBadge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import TimelineDisplay, { TimelinePoint } from '@/components/ui/TimelineDisplay';
import HealthIndicator from '@/components/ui/HealthIndicator';
import StatCard from '@/components/ui/StatCard';
import TrendIndicator from '@/components/ui/TrendIndicator';
import { Database } from '@/integrations/supabase/types';
import { differenceInDays } from 'date-fns';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectOverviewTabProps {
  project: Project;
  customerName?: string | null;
  customerId?: string | null;
  onEditClick?: () => void;
  onAddItemClick?: () => void;
}

const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({
  project,
  customerName,
  customerId,
  onEditClick,
  onAddItemClick,
}) => {
  const daysRemaining = useMemo(() => {
    if (!project.target_end_date) return null;
    const today = new Date();
    const endDate = new Date(project.target_end_date);
    return differenceInDays(endDate, today);
  }, [project.target_end_date]);

  const timelinePoints = useMemo(() => {
    const points: TimelinePoint[] = [];

    if (project.start_date) {
      const startDate = new Date(project.start_date);
      const today = new Date();
      points.push({
        label: 'Start Date',
        date: project.start_date,
        status: startDate <= today ? 'past' : 'future',
      });
    } else {
      points.push({
        label: 'Start Date',
        date: null,
        status: 'future',
      });
    }

    if (project.target_end_date) {
      const endDate = new Date(project.target_end_date);
      const today = new Date();
      points.push({
        label: 'Target End Date',
        date: project.target_end_date,
        status:
          endDate < today
            ? 'overdue'
            : endDate.getTime() === today.getTime()
              ? 'current'
              : 'future',
      });
    } else {
      points.push({
        label: 'Target End Date',
        date: null,
        status: 'future',
      });
    }

    return points;
  }, [project.start_date, project.target_end_date]);

  // Calculate budget metrics
  const budget = project.total_budget || 0;
  const spent = project.current_expenses || 0;
  const remaining = budget - spent;
  const contractValue = project.contract_value || 0;
  const estimatedGrossProfit = contractValue - spent;
  const gpPercentage = contractValue > 0 ? (estimatedGrossProfit / contractValue) * 100 : 0;
  const budgetProgress = budget > 0 ? (spent / budget) * 100 : 0;

  const scheduleProgress = useMemo(() => {
    if (!project.start_date || !project.target_end_date) return 0;

    const startDate = new Date(project.start_date);
    const endDate = new Date(project.target_end_date);
    const today = new Date();

    const totalDuration = differenceInDays(endDate, startDate);
    if (totalDuration <= 0) return 100;

    const elapsed = differenceInDays(today, startDate);
    const progressPercentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

    return progressPercentage;
  }, [project.start_date, project.target_end_date]);

  const getBudgetStatus = () => {
    if (budget <= 0) return 'unknown';
    if (budgetProgress > 100) return 'critical';
    if (budgetProgress > 85) return 'warning';
    return 'good';
  };

  const getScheduleStatus = () => {
    if (!project.start_date || !project.target_end_date) return 'unknown';
    const endDate = new Date(project.target_end_date);
    const today = new Date();

    if (endDate < today) return 'critical';
    if (daysRemaining !== null && daysRemaining < 7) return 'warning';
    return 'good';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{project.projectname}</h2>
            <StatusBadge status={project.status || 'PENDING'} />
          </div>
          <p className="text-sm text-muted-foreground">ID: {project.projectid}</p>

          {customerName && (
            <div className="flex items-center gap-2 mt-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">{customerName}</span>
                {customerId && (
                  <span className="text-xs text-muted-foreground ml-2">({customerId})</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEditClick}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Project Details */}
        <div className="md:col-span-5 space-y-6">
          {/* Description Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              {project.description ? (
                <p className="text-sm">{project.description}</p>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No description has been added yet.
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={onEditClick}>
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Add Description
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Dates Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineDisplay points={timelinePoints} />

              {daysRemaining !== null && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      daysRemaining < 0
                        ? 'text-destructive'
                        : daysRemaining < 7
                          ? 'text-amber-600'
                          : 'text-green-600'
                    )}
                  >
                    {daysRemaining < 0
                      ? `Overdue by ${Math.abs(daysRemaining)} days`
                      : daysRemaining === 0
                        ? 'Due today'
                        : `${daysRemaining} days remaining`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Financial & Health */}
        <div className="md:col-span-7 space-y-6">
          {/* Financial Snapshot Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                Financial Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard
                  label="Contract Value"
                  value={formatCurrency(contractValue)}
                  badge={
                    contractValue > 0 ? { text: 'Active' } : { text: 'Not Set', variant: 'outline' }
                  }
                />

                <StatCard
                  label="Budget"
                  value={formatCurrency(budget)}
                  secondaryLabel="Remaining"
                  secondaryValue={formatCurrency(remaining)}
                  badge={
                    budgetProgress > 100
                      ? { text: 'Over Budget', variant: 'destructive' }
                      : undefined
                  }
                />

                <StatCard
                  label="Spent to Date"
                  value={formatCurrency(spent)}
                  secondaryLabel="of Budget"
                  secondaryValue={
                    budget > 0 ? `${Math.min(Math.round(budgetProgress), 100)}%` : 'N/A'
                  }
                  trend={spent > budget ? 'down' : 'up'}
                  trendValue={spent > 0 ? budgetProgress : 0}
                />

                <StatCard
                  label="Est. Gross Profit"
                  value={formatCurrency(estimatedGrossProfit)}
                  secondaryLabel="Margin"
                  secondaryValue={`${Math.round(gpPercentage)}%`}
                  valueClassName={estimatedGrossProfit < 0 ? 'text-destructive' : undefined}
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Health Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                Project Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HealthIndicator
                metrics={[
                  {
                    name: 'Budget Status',
                    status: getBudgetStatus(),
                    value: Math.min(budgetProgress, 100),
                    label:
                      budget > 0
                        ? budgetProgress > 100
                          ? 'Over Budget'
                          : budgetProgress > 85
                            ? 'Near Limit'
                            : 'On Track'
                        : 'Not Set',
                  },
                  {
                    name: 'Schedule Status',
                    status: getScheduleStatus(),
                    value: scheduleProgress,
                    label:
                      daysRemaining !== null
                        ? daysRemaining < 0
                          ? 'Overdue'
                          : daysRemaining === 0
                            ? 'Due Today'
                            : 'On Track'
                        : 'Not Set',
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewTab;
