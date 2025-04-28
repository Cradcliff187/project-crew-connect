import { DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import { formatCurrency } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectBudgetCardProps {
  project: Project;
}

const ProjectBudgetCard = ({ project }: ProjectBudgetCardProps) => {
  // Format currency
  const getBudgetAmount = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '$0';
    return formatCurrency(amount);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <DollarSign className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">Budget</p>
                <p className="text-sm font-medium">{getBudgetAmount(project.total_budget)}</p>
                {project.total_actual_expenses !== null &&
                project.total_actual_expenses !== undefined ? (
                  <p className="text-xs text-muted-foreground">
                    Spent: {getBudgetAmount(project.total_actual_expenses)}
                  </p>
                ) : null}
              </div>
            </div>
            {project.budget_status && <StatusBadge status={project.budget_status as StatusType} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectBudgetCard;
