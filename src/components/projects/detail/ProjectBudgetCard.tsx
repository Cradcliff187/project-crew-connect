import React from 'react';
import { DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/common/status/StatusBadge';
import { StatusType } from '@/types/common';
import { formatCurrency } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Ban, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectBudgetCardProps {
  project: Project | null;
}

const ProjectBudgetCard = ({ project }: ProjectBudgetCardProps) => {
  if (!project) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    );
  }

  const budget = project.total_budget || 0;
  const spent = project.current_expenses || 0;
  const remaining = budget - spent;
  const progress = budget > 0 ? (spent / budget) * 100 : 0;

  let Icon = AlertTriangle;
  let progressColor = 'bg-gray-400';
  let budgetStatusText = 'Budget Not Set';

  if (budget > 0) {
    if (progress > 100) {
      Icon = Ban;
      progressColor = 'bg-red-500';
      budgetStatusText = 'Over Budget';
    } else if (progress >= 85) {
      Icon = AlertTriangle;
      progressColor = 'bg-yellow-500';
      budgetStatusText = 'Nearing Budget';
    } else {
      Icon = CheckCircle;
      progressColor = 'bg-green-500';
      budgetStatusText = 'On Track';
    }
  }

  const displayStatus = (project.budget_status as StatusType) || 'PENDING';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center justify-between">
          <span>Budget Status</span>
          <StatusBadge status={displayStatus} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(remaining)}</div>
        <p className="text-xs text-muted-foreground">
          Remaining of {formatCurrency(budget)} budget ({budgetStatusText})
        </p>
        <Progress value={Math.min(progress, 100)} className={`mt-4 h-2 ${progressColor}`} />
      </CardContent>
    </Card>
  );
};

export default ProjectBudgetCard;
