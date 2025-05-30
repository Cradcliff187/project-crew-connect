import React from 'react';
import { GradientCard } from '@/components/ui/GradientCard';
import { AlertCircle, CheckCircle2, DollarSign, PieChart, TrendingUp } from 'lucide-react';

interface BudgetOverviewProps {
  totalBudget: number;
  originalSellingPrice: number;
  originalContingency: number;
  currentExpenses: number;
  budgetStatus: string;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  totalBudget,
  originalSellingPrice,
  originalContingency,
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

  // Determine status variant for gradient card
  const getStatusVariant = (): 'green' | 'yellow' | 'red' | 'blue' => {
    switch (budgetStatus) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'on_track':
        return 'green';
      default:
        return 'blue';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (budgetStatus) {
      case 'critical':
      case 'warning':
        return AlertCircle;
      case 'on_track':
        return CheckCircle2;
      default:
        return PieChart;
    }
  };

  // Format status text
  const formatStatus = () => {
    if (budgetStatus === 'not_set') return 'Not Set';
    return budgetStatus.charAt(0).toUpperCase() + budgetStatus.slice(1).replace('_', ' ');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GradientCard
        title="Total Budget"
        value={formatCurrency(totalBudget)}
        icon={DollarSign}
        variant="blue"
        subtitle={`Items: ${formatCurrency(originalSellingPrice)} + Contingency: ${formatCurrency(originalContingency || 0)}`}
      />

      <GradientCard
        title="Current Expenses"
        value={formatCurrency(currentExpenses)}
        icon={TrendingUp}
        variant={percentUsed > 90 ? 'red' : percentUsed > 75 ? 'yellow' : 'green'}
        subtitle={`${formatCurrency(remaining)} remaining`}
        trend={{
          value: percentUsed,
          label: 'of budget used',
        }}
      />

      <GradientCard
        title="Budget Status"
        value={formatStatus()}
        icon={getStatusIcon()}
        variant={getStatusVariant()}
        subtitle={
          budgetStatus === 'critical'
            ? 'Over budget'
            : budgetStatus === 'warning'
              ? 'Near limit'
              : budgetStatus === 'on_track'
                ? 'Within budget'
                : 'Budget not configured'
        }
      />
    </div>
  );
};

export default BudgetOverview;
