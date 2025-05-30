import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database } from '@/integrations/supabase/types';
import { formatCurrency, formatDate } from '@/lib/utils'; // Assuming formatDate exists
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, PlusCircle, Trash2 } from 'lucide-react';
import AddDiscountDialog from './AddDiscountDialog'; // Import the dialog
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteDiscount } from '@/services/discountService'; // Import delete service
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { GradientCard } from '@/components/ui/GradientCard';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Calculator,
  Receipt,
  CreditCard,
  Percent,
  Wallet,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define types based on generated Supabase types
type Project = Database['public']['Tables']['projects']['Row'];
type BudgetItem = Database['public']['Tables']['project_budget_items']['Row'];
type Discount = Database['public']['Tables']['discounts']['Row']; // Keep local definition

// Define FetchedChangeOrder type locally
type FetchedChangeOrder = {
  id: string;
  title: string | null;
  cost_impact: number | null;
  revenue_impact: number | null;
};

interface FinancialSummaryTabProps {
  project: Project | null;
  budgetItems: BudgetItem[];
  approvedChangeOrders: FetchedChangeOrder[];
  discounts: Discount[];
  onDataRefresh: () => void; // Add callback to refresh data on parent
}

const FinancialSummaryTab: React.FC<FinancialSummaryTabProps> = ({
  project,
  budgetItems,
  approvedChangeOrders,
  discounts,
  onDataRefresh, // Receive refresh callback
}) => {
  const [showAddDiscountDialog, setShowAddDiscountDialog] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);

  // Log received props
  console.log('[FinancialSummaryTab] Received Project:', project);
  console.log('[FinancialSummaryTab] Received Budget Items:', budgetItems);
  console.log('[FinancialSummaryTab] Received Approved COs:', approvedChangeOrders);
  console.log('[FinancialSummaryTab] Received Discounts:', discounts);

  if (!project) {
    return <div>Loading project financial data...</div>;
  }

  // --- Calculations ---
  console.log('[FinancialSummaryTab] Starting Calculations...');

  // Base Project Values
  const currentContractValue = project.contract_value || 0;
  const currentBudget = project.total_budget || 0;
  const actualExpenses = project.current_expenses || 0;
  console.log('[FinancialSummaryTab] Base Values:', {
    currentContractValue,
    currentBudget,
    actualExpenses,
  });

  // Discounts
  const totalDiscounts = discounts.reduce((sum, d) => sum + (d.amount || 0), 0);
  console.log('[FinancialSummaryTab] Total Discounts:', totalDiscounts);

  // Change Orders
  const totalCoRevenueImpact = approvedChangeOrders.reduce(
    (sum, co) => sum + (co.revenue_impact || 0),
    0
  );
  const totalCoCostImpact = approvedChangeOrders.reduce(
    (sum, co) => sum + (co.cost_impact || 0),
    0
  );
  console.log('[FinancialSummaryTab] CO Impacts:', { totalCoRevenueImpact, totalCoCostImpact });

  // Derived Values
  const originalContractValue = currentContractValue - totalCoRevenueImpact;
  const originalBudget = currentBudget - totalCoCostImpact;
  const expectedRevenue = Math.max(0, currentContractValue - totalDiscounts);
  const estimatedGrossProfit = currentContractValue - currentBudget;
  const expectedActualGrossProfit = expectedRevenue - actualExpenses;
  const expectedProfitVariance = expectedActualGrossProfit - estimatedGrossProfit;
  console.log('[FinancialSummaryTab] Derived Values:', {
    originalContractValue,
    originalBudget,
    expectedRevenue,
    estimatedGrossProfit,
    expectedActualGrossProfit,
    expectedProfitVariance,
  });

  // Contingency Calculations
  const contingencyItems = budgetItems.filter(item => item.is_contingency);
  const budgetedContingency = contingencyItems.reduce(
    (sum, item) => sum + (item.estimated_amount || 0),
    0
  );
  const nonContingencyBudget = currentBudget - budgetedContingency;
  const contingencyUsed = Math.max(0, actualExpenses - nonContingencyBudget);
  const contingencyRemaining = budgetedContingency - contingencyUsed;
  console.log('[FinancialSummaryTab] Contingency:', {
    budgetedContingency,
    contingencyUsed,
    contingencyRemaining,
    nonContingencyBudget,
  });

  // Budget vs Actual Variance
  const costVariance = currentBudget - actualExpenses;
  console.log('[FinancialSummaryTab] Cost Variance:', costVariance);

  // --- Handlers ---
  const handleAddDiscountClick = () => {
    setShowAddDiscountDialog(true);
  };

  const handleDiscountAdded = () => {
    onDataRefresh(); // Trigger data refresh in parent component
  };

  const confirmDeleteDiscount = async () => {
    if (!discountToDelete) return;
    const success = await deleteDiscount(discountToDelete.id);
    if (success) {
      onDataRefresh();
    }
    setDiscountToDelete(null); // Close dialog regardless of success for simplicity, toast indicates error
  };

  // --- Render ---
  console.log('[FinancialSummaryTab] Rendering metrics...', {
    currentContractValueF: formatCurrency(currentContractValue),
    currentBudgetF: formatCurrency(currentBudget),
    actualExpensesF: formatCurrency(actualExpenses),
    totalDiscountsF: formatCurrency(totalDiscounts),
    totalCoRevenueImpactF: formatCurrency(totalCoRevenueImpact),
    totalCoCostImpactF: formatCurrency(totalCoCostImpact),
    expectedRevenueF: formatCurrency(expectedRevenue),
    estimatedGrossProfitF: formatCurrency(estimatedGrossProfit),
    expectedActualGrossProfitF: formatCurrency(expectedActualGrossProfit),
    budgetedContingencyF: formatCurrency(budgetedContingency),
    contingencyUsedF: formatCurrency(contingencyUsed),
    contingencyRemainingF: formatCurrency(contingencyRemaining),
    costVarianceF: formatCurrency(costVariance),
  });

  return (
    <TooltipProvider>
      <AlertDialog open={!!discountToDelete} onOpenChange={() => setDiscountToDelete(null)}>
        <div className="space-y-6">
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GradientCard
              title="Contract Value"
              value={formatCurrency(currentContractValue)}
              icon={DollarSign}
              variant="blue"
              subtitle={`${formatCurrency(currentContractValue + totalCoRevenueImpact)} with changes`}
            />

            <GradientCard
              title="Total Cost"
              value={formatCurrency(currentBudget)}
              icon={Calculator}
              variant={currentBudget > currentContractValue ? 'red' : 'purple'}
              subtitle={`Budget: ${formatCurrency(currentBudget)}`}
              trend={
                currentBudget > 0
                  ? {
                      value: ((currentBudget - currentContractValue) / currentBudget) * 100,
                      label: currentBudget > currentContractValue ? 'over budget' : 'under budget',
                    }
                  : undefined
              }
            />

            <GradientCard
              title="Gross Profit"
              value={formatCurrency(estimatedGrossProfit)}
              icon={TrendingUp}
              variant={estimatedGrossProfit < 0 ? 'red' : 'green'}
              subtitle={`${((estimatedGrossProfit / currentContractValue) * 100).toFixed(1)}% margin`}
              trend={
                estimatedGrossProfit > 0
                  ? {
                      value: (estimatedGrossProfit / currentContractValue) * 100,
                      label: 'profit margin',
                    }
                  : undefined
              }
            />

            <GradientCard
              title="Completion"
              value={`${((actualExpenses / currentBudget) * 100).toFixed(0)}%`}
              icon={Progress as any}
              variant={
                currentContractValue > 0
                  ? actualExpenses > currentBudget
                    ? 'yellow'
                    : 'blue'
                  : 'blue'
              }
              subtitle="Cost progress"
            />
          </div>

          {/* Revenue & Cost Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown Card */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center font-montserrat">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-opensans">
                      Base Contract
                    </span>
                    <span className="font-medium font-montserrat">
                      {formatCurrency(originalContractValue)}
                    </span>
                  </div>

                  {totalCoRevenueImpact !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-opensans">
                        Change Orders ({approvedChangeOrders.length})
                      </span>
                      <span
                        className={cn(
                          'font-medium font-montserrat',
                          totalCoRevenueImpact >= 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {totalCoRevenueImpact >= 0 ? '+' : ''}
                        {formatCurrency(totalCoRevenueImpact)}
                      </span>
                    </div>
                  )}

                  {totalDiscounts > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-opensans">
                        Discounts ({discounts.length})
                      </span>
                      <span className="text-red-600 font-medium font-montserrat">
                        -{formatCurrency(totalDiscounts)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium font-opensans">Total Revenue</span>
                      <span className="font-bold text-lg font-montserrat">
                        {formatCurrency(currentContractValue + totalCoRevenueImpact)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown Card */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center font-montserrat">
                  <Calculator className="h-5 w-5 mr-2 text-purple-600" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-opensans">
                      Budget (Estimated)
                    </span>
                    <span className="font-medium font-montserrat">
                      {formatCurrency(currentBudget)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-opensans">
                      Actual Expenses
                    </span>
                    <span
                      className={cn(
                        'font-medium font-montserrat',
                        actualExpenses > currentBudget ? 'text-red-600' : 'text-green-600'
                      )}
                    >
                      {formatCurrency(actualExpenses)}
                    </span>
                  </div>

                  {totalCoCostImpact !== 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-opensans">
                        Change Order Impact
                      </span>
                      <span
                        className={cn(
                          'font-medium font-montserrat',
                          totalCoCostImpact > 0 ? 'text-red-600' : 'text-green-600'
                        )}
                      >
                        {totalCoCostImpact > 0 ? '+' : ''}
                        {formatCurrency(Math.abs(totalCoCostImpact))}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium font-opensans">Total Cost</span>
                      <span
                        className={cn(
                          'font-bold text-lg font-montserrat',
                          currentBudget > currentContractValue ? 'text-red-600' : ''
                        )}
                      >
                        {formatCurrency(currentBudget)}
                      </span>
                    </div>
                  </div>

                  <Progress
                    value={Math.min((actualExpenses / currentBudget) * 100, 100)}
                    className="h-2 mt-2"
                  />
                  <p className="text-xs text-muted-foreground text-center font-opensans">
                    {((actualExpenses / currentBudget) * 100).toFixed(0)}% of budget used
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center font-montserrat">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                Financial Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Budget vs Actual */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium font-opensans">Budget Utilization</span>
                  <span className="text-sm text-muted-foreground font-opensans">
                    {formatCurrency(actualExpenses)} / {formatCurrency(currentBudget)}
                  </span>
                </div>
                <Progress
                  value={Math.min((actualExpenses / currentBudget) * 100, 100)}
                  className={cn(
                    'h-3',
                    actualExpenses > currentBudget ? 'bg-red-100' : 'bg-gray-100'
                  )}
                />
                {actualExpenses > currentBudget && (
                  <p className="text-xs text-red-600 font-opensans">
                    {(actualExpenses - currentBudget).toFixed(1)}% over budget
                  </p>
                )}
              </div>

              {/* Revenue Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium font-opensans">Revenue Progress</span>
                  <span className="text-sm text-muted-foreground font-opensans">
                    {formatCurrency(actualExpenses)} cost vs{' '}
                    {formatCurrency(currentContractValue + totalCoRevenueImpact)} revenue
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    (actualExpenses / (currentContractValue + totalCoRevenueImpact)) * 100,
                    100
                  )}
                  className="h-3"
                />
              </div>

              {/* Profit Margin Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium font-opensans">Profit Margin</span>
                  <span
                    className={cn(
                      'text-lg font-bold font-montserrat',
                      estimatedGrossProfit < 0
                        ? 'text-red-600'
                        : estimatedGrossProfit < 10
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    )}
                  >
                    {((estimatedGrossProfit / currentContractValue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      estimatedGrossProfit < 0
                        ? 'bg-red-500'
                        : estimatedGrossProfit < 10
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    )}
                    style={{
                      width: `${Math.min(Math.max((estimatedGrossProfit / currentContractValue) * 100, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {(actualExpenses > currentBudget && actualExpenses > 0) || estimatedGrossProfit < 10 ? (
            <Card
              className={cn(
                'shadow-sm',
                actualExpenses > currentBudget
                  ? 'border-red-200 bg-red-50'
                  : 'border-yellow-200 bg-yellow-50'
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center font-montserrat">
                  <AlertCircle
                    className={cn(
                      'h-5 w-5 mr-2',
                      actualExpenses > currentBudget ? 'text-red-600' : 'text-yellow-600'
                    )}
                  />
                  Financial Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {actualExpenses > currentBudget && actualExpenses > 0 && (
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-red-700 font-opensans">
                        Project is {(actualExpenses - currentBudget).toFixed(1)}% over budget
                      </span>
                    </li>
                  )}
                  {actualExpenses > 0 && actualExpenses <= currentBudget && (
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-600 mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-700 font-opensans">
                        Budget utilization is at{' '}
                        {((actualExpenses / currentBudget) * 100).toFixed(0)}%
                      </span>
                    </li>
                  )}
                  {estimatedGrossProfit < 10 && estimatedGrossProfit >= 0 && (
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-600 mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-700 font-opensans">
                        Low profit margin of{' '}
                        {((estimatedGrossProfit / currentContractValue) * 100).toFixed(1)}%
                      </span>
                    </li>
                  )}
                  {estimatedGrossProfit < 0 && (
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-red-700 font-opensans">
                        Project is operating at a loss (-
                        {((estimatedGrossProfit / currentContractValue) * 100).toFixed(1)}% margin)
                      </span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Add Discount Dialog Instance */}
        {project && (
          <AddDiscountDialog
            projectId={project.projectid}
            open={showAddDiscountDialog}
            onOpenChange={setShowAddDiscountDialog}
            onDiscountAdded={handleDiscountAdded}
          />
        )}

        {/* Alert Dialog Content */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the discount of
              {discountToDelete && ` ${formatCurrency(discountToDelete.amount)}`}
              {discountToDelete?.description && ` for "${discountToDelete.description}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDiscountToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteDiscount}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Discount
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default FinancialSummaryTab;
