
import { DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectDetails } from '../ProjectDetails';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import { formatCurrency } from '@/lib/utils';

interface ProjectBudgetCardProps {
  project: ProjectDetails;
}

const ProjectBudgetCard = ({ project }: ProjectBudgetCardProps) => {
  // Format currency
  const getBudgetAmount = (amount: number | null) => {
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
                <p className="text-sm font-medium">
                  {getBudgetAmount(project.total_budget)}
                </p>
                {project.current_expenses ? (
                  <p className="text-xs text-muted-foreground">
                    Spent: {getBudgetAmount(project.current_expenses)}
                  </p>
                ) : null}
              </div>
            </div>
            {project.budget_status && (
              <StatusBadge 
                status={project.budget_status as StatusType} 
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectBudgetCard;
