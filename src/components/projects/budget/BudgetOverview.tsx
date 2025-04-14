import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, DollarSign, PieChart, TrendingUp } from 'lucide-react';

interface BudgetOverviewProps {
  totalBudget: number;
  currentExpenses: number;
  budgetStatus: string;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  totalBudget,
  currentExpenses,
  budgetStatus,
}) => {
  // Calculate percentage used
  const percentUsed =
    totalBudget > 0 ? Math.min(Math.round((currentExpenses / totalBudget) * 100), 100) : 0;

  // Calculate remaining budget
  const remaining = Math.max(totalBudget - currentExpenses, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'critical':
        return {
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        };
      case 'warning':
        return {
          color: 'text-amber-500',
          bgColor: 'bg-amber-100',
          icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
        };
      case 'on_track':
        return {
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        };
      default:
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          icon: <PieChart className="h-5 w-5 text-gray-500" />,
        };
    }
  };

  const { color, bgColor, icon } = getStatusInfo(budgetStatus);

  // Determine progress color
  const progressColor =
    budgetStatus === 'critical'
      ? 'bg-red-500'
      : budgetStatus === 'warning'
        ? 'bg-amber-500'
        : 'bg-green-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-[#0485ea]" />
            <span className="text-2xl font-bold">{formatCurrency(totalBudget)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-[#0485ea]" />
            <span className="text-2xl font-bold">{formatCurrency(currentExpenses)}</span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{percentUsed}% of budget used</span>
              <span>{formatCurrency(remaining)} remaining</span>
            </div>
            <Progress value={percentUsed} className={progressColor} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Budget Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            {icon}
            <div className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${color} ${bgColor}`}>
              {budgetStatus === 'not_set'
                ? 'Not Set'
                : budgetStatus.charAt(0).toUpperCase() + budgetStatus.slice(1).replace('_', ' ')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetOverview;
