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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
                <CardDescription>Contract value tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Original Contract</dt>
                    <dd>{formatCurrency(originalContractValue)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Approved COs (+)</dt>
                    <dd>{formatCurrency(totalCoRevenueImpact)}</dd>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1 mt-1">
                    <dt>Current Contract</dt>
                    <dd>{formatCurrency(currentContractValue)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Discounts (-)</dt>
                    <dd className="text-orange-600">{formatCurrency(totalDiscounts)}</dd>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1 mt-1">
                    <dt>
                      Expected Revenue
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground ml-1 inline-block cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Current Contract Value minus Discounts. Actual revenue depends on
                            invoicing.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </dt>
                    <dd>{formatCurrency(expectedRevenue)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contingency</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Budgeted</dt>
                    <dd>{formatCurrency(budgetedContingency)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Used (-)</dt>
                    <dd>{formatCurrency(contingencyUsed)}</dd>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1 mt-1">
                    <dt>Remaining</dt>
                    <dd className={`${contingencyRemaining < 0 ? 'text-red-600' : ''}`}>
                      {formatCurrency(contingencyRemaining)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Summary</CardTitle>
                <CardDescription>Cost tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Original Budget</dt>
                    <dd>{formatCurrency(originalBudget)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Approved COs (+)</dt>
                    <dd>{formatCurrency(totalCoCostImpact)}</dd>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1 mt-1">
                    <dt>Current Budget</dt>
                    <dd>{formatCurrency(currentBudget)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Actual Expenses (-)</dt>
                    <dd>{formatCurrency(actualExpenses)}</dd>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1 mt-1">
                    <dt>Cost Variance</dt>
                    <dd className={`${costVariance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(costVariance)}
                      <span className="text-xs text-muted-foreground ml-1">
                        {costVariance >= 0 ? '(Under)' : '(Over)'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Estimated GP</dt>
                    <dd>{formatCurrency(estimatedGrossProfit)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      Expected Actual GP
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground ml-1 inline-block cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Expected Revenue minus Actual Expenses. Actual GP depends on final
                            invoiced revenue.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </dt>
                    <dd>{formatCurrency(expectedActualGrossProfit)}</dd>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1 mt-1">
                    <dt>
                      Expected Variance
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground ml-1 inline-block cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Difference between Expected Actual GP and Estimated GP.</p>
                        </TooltipContent>
                      </Tooltip>
                    </dt>
                    <dd
                      className={`${expectedProfitVariance < 0 ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {formatCurrency(expectedProfitVariance)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Column 3 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Change Orders{' '}
                  <span className="text-muted-foreground text-sm">
                    ({approvedChangeOrders.length} Approved)
                  </span>
                </CardTitle>
                <CardDescription>Summary of approved financial impacts.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm font-medium mb-3 border-b pb-2">
                  <span>Total Cost Impact:</span>
                  <span>{formatCurrency(totalCoCostImpact)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium mb-3 border-b pb-2">
                  <span>Total Revenue Impact:</span>
                  <span>{formatCurrency(totalCoRevenueImpact)}</span>
                </div>

                {approvedChangeOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No approved change orders impacting financials.
                  </p>
                ) : (
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-3 pr-2">
                      {approvedChangeOrders.map(co => (
                        <div key={co.id} className="text-xs border-b pb-2 last:border-b-0">
                          <p className="font-medium truncate" title={co.title || 'Untitled'}>
                            {co.title || 'Untitled'}
                          </p>
                          <div className="flex justify-between text-muted-foreground mt-1">
                            <span>Cost: {formatCurrency(co.cost_impact || 0)}</span>
                            <span>Revenue: {formatCurrency(co.revenue_impact || 0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Discounts</CardTitle>
                  <CardDescription>Project-level discounts applied.</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={handleAddDiscountClick}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Discount
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm font-medium mb-3 border-b pb-2">
                  <span>Total Applied:</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(totalDiscounts)}
                  </span>
                </div>
                {discounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No discounts applied yet.
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto pr-1">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-2 py-1">Date</TableHead>
                          <TableHead className="px-2 py-1">Description</TableHead>
                          <TableHead className="text-right px-2 py-1">Amount</TableHead>
                          <TableHead className="w-[40px] px-1 py-1"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {discounts.map(discount => (
                          <TableRow key={discount.id}>
                            <TableCell className="px-2 py-1">
                              {formatDate(discount.applied_date)}
                            </TableCell>
                            <TableCell className="px-2 py-1 break-words">
                              {discount.description || '-'}
                            </TableCell>
                            <TableCell className="text-right px-2 py-1">
                              {formatCurrency(discount.amount)}
                            </TableCell>
                            <TableCell className="px-1 py-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500 hover:text-red-700 h-6 w-6"
                                      onClick={() => setDiscountToDelete(discount)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Delete Discount</TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
