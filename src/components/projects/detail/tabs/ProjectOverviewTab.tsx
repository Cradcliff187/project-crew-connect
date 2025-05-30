import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Calendar,
  DollarSign,
  Activity,
  User,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from '@/components/common/status/StatusBadge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import TimelineDisplay, { TimelinePoint } from '@/components/ui/TimelineDisplay';
import HealthIndicator from '@/components/ui/HealthIndicator';
import { GradientCard } from '@/components/ui/GradientCard';
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
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GradientCard
          title="Contract Value"
          value={formatCurrency(contractValue)}
          icon={DollarSign}
          variant="blue"
          subtitle={contractValue > 0 ? 'Active' : 'Not Set'}
        />

        <GradientCard
          title="Budget"
          value={formatCurrency(budget)}
          icon={TrendingUp}
          variant="green"
          subtitle={`${formatCurrency(remaining)} remaining`}
          trend={
            budgetProgress > 100
              ? { value: -budgetProgress + 100, label: 'over budget' }
              : undefined
          }
        />

        <GradientCard
          title="Spent to Date"
          value={formatCurrency(spent)}
          icon={Clock}
          variant={budgetProgress > 100 ? 'red' : budgetProgress > 85 ? 'yellow' : 'purple'}
          subtitle={budget > 0 ? `${Math.min(Math.round(budgetProgress), 100)}% of budget` : 'N/A'}
        />

        <GradientCard
          title="Est. Gross Profit"
          value={formatCurrency(estimatedGrossProfit)}
          icon={TrendingUp}
          variant={estimatedGrossProfit < 0 ? 'red' : 'green'}
          subtitle={`${Math.round(gpPercentage)}% margin`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Project Details */}
        <div className="md:col-span-5 space-y-6">
          {/* Description Card */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium font-montserrat flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Project Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.description ? (
                <p className="text-sm font-opensans">{project.description}</p>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-sm text-muted-foreground font-opensans">
                    No description has been added yet.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 font-opensans hover:bg-blue-50"
                    onClick={onEditClick}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Add Description
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Dates Card */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center font-montserrat">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Key Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineDisplay points={timelinePoints} />

              {daysRemaining !== null && (
                <div className="mt-4 pt-3 border-t border-border">
                  <p
                    className={cn(
                      'text-sm font-medium font-opensans',
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

        {/* Right Column: Project Health */}
        <div className="md:col-span-7 space-y-6">
          {/* Project Health Card */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center font-montserrat">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
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

          {/* Quick Actions Card */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center font-montserrat">
                <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={onEditClick}
                  variant="outline"
                  className="w-full font-opensans hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
                <Button
                  onClick={onAddItemClick}
                  className="w-full bg-[#0485ea] hover:bg-[#0375d1] font-opensans"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewTab;
