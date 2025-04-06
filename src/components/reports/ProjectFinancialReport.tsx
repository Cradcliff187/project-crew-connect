
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import { Download, FileText, RefreshCw } from 'lucide-react';
import FinancialSummaryCard from './components/FinancialSummaryCard';
import ReportFilters from './components/ReportFilters';

interface ProjectFinancialReportProps {
  projectId?: string;
}

const ProjectFinancialReport: React.FC<ProjectFinancialReportProps> = ({ projectId }) => {
  // State for report filters
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(projectId);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  // Set initial project ID from props
  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  }, [projectId]);

  // Fetch project financial data
  const { data: financialData, isLoading, error, refetch } = useQuery({
    queryKey: ['project-financial-report', selectedProjectId, dateRange],
    enabled: !!selectedProjectId,
    queryFn: async () => {
      // 1. Fetch project basic info
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('projectid, projectname, customername, total_budget, current_expenses, budget_status')
        .eq('projectid', selectedProjectId)
        .single();

      if (projectError) throw projectError;

      // 2. Fetch change orders for this project
      const { data: changeOrdersData, error: changeOrdersError } = await supabase
        .from('change_orders')
        .select('id, title, status, total_amount, impact_days, requested_date, approved_date')
        .eq('entity_type', 'PROJECT')
        .eq('entity_id', selectedProjectId)
        .order('created_at', { ascending: false });

      if (changeOrdersError) throw changeOrdersError;

      // 3. Fetch expenses for this project
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('id, description, amount, expense_date, expense_type, vendor_id')
        .eq('entity_type', 'PROJECT')
        .eq('entity_id', selectedProjectId)
        .order('expense_date', { ascending: false });

      if (expensesError) throw expensesError;

      // 4. Fetch budget items for this project
      const { data: budgetItemsData, error: budgetItemsError } = await supabase
        .from('project_budget_items')
        .select('id, category, description, estimated_amount, actual_amount')
        .eq('project_id', selectedProjectId)
        .order('category', { ascending: true });

      if (budgetItemsError) throw budgetItemsError;

      // Calculate financial metrics
      const totalChangeOrderAmount = changeOrdersData.reduce((sum, co) => 
        co.status === 'APPROVED' || co.status === 'IMPLEMENTED' ? sum + (co.total_amount || 0) : sum, 0);
      
      const originalBudget = projectData.total_budget || 0;
      const currentBudget = originalBudget + totalChangeOrderAmount;
      const totalExpenses = projectData.current_expenses || 0;
      const remainingBudget = currentBudget - totalExpenses;
      const budgetUtilization = currentBudget > 0 ? (totalExpenses / currentBudget) * 100 : 0;

      // Group expenses by type
      const expensesByType = expensesData.reduce((acc, expense) => {
        const type = expense.expense_type || 'Other';
        if (!acc[type]) acc[type] = 0;
        acc[type] += (expense.amount || 0);
        return acc;
      }, {} as Record<string, number>);

      return {
        project: projectData,
        changeOrders: changeOrdersData,
        expenses: expensesData,
        budgetItems: budgetItemsData,
        metrics: {
          originalBudget,
          currentBudget,
          totalExpenses,
          remainingBudget,
          totalChangeOrderAmount,
          budgetUtilization,
          expensesByType
        }
      };
    },
    meta: {
      onError: (error: any) => {
        console.error('Error loading project financial report:', error);
        toast({
          title: 'Error loading financial data',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  });

  // Handle filter changes
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleDateRangeChange = (range: { start: Date | null; end: Date | null }) => {
    setDateRange(range);
  };

  // Handle export to CSV
  const handleExport = () => {
    if (!financialData) return;
    
    // Convert data to CSV format
    const projectRow = `Project ID,${financialData.project.projectid}\nProject Name,${financialData.project.projectname}\nCustomer,${financialData.project.customername}\n\n`;
    
    const metricsRows = [
      `Financial Metrics,,`,
      `Original Budget,${formatCurrency(financialData.metrics.originalBudget)},`,
      `Change Orders Impact,${formatCurrency(financialData.metrics.totalChangeOrderAmount)},`,
      `Current Budget,${formatCurrency(financialData.metrics.currentBudget)},`,
      `Total Expenses,${formatCurrency(financialData.metrics.totalExpenses)},`,
      `Remaining Budget,${formatCurrency(financialData.metrics.remainingBudget)},`,
      `Budget Utilization,${financialData.metrics.budgetUtilization.toFixed(2)}%,`,
      `\n`
    ].join('\n');
    
    const expensesHeader = 'Expense ID,Description,Amount,Date,Type\n';
    const expensesRows = financialData.expenses.map(exp => 
      `${exp.id},${exp.description},${exp.amount},${exp.expense_date},${exp.expense_type || 'Other'}`
    ).join('\n');
    
    const changeOrdersHeader = '\nChange Order ID,Title,Status,Amount,Impact Days,Requested Date\n';
    const changeOrdersRows = financialData.changeOrders.map(co => 
      `${co.id},${co.title},${co.status},${co.total_amount},${co.impact_days},${co.requested_date}`
    ).join('\n');
    
    const csvContent = `Project Financial Report\n\n${projectRow}${metricsRows}${expensesHeader}${expensesRows}${changeOrdersHeader}${changeOrdersRows}`;
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `project-report-${selectedProjectId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Financial Report</h2>
          <p className="text-muted-foreground">
            Analysis of project financial performance and metrics.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={handleExport}
            disabled={isLoading || !financialData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <ReportFilters
        onProjectSelect={handleProjectSelect}
        onDateRangeChange={handleDateRangeChange}
        selectedProjectId={selectedProjectId}
        dateRange={dateRange}
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Error loading financial report. Please try again.
            </p>
            <Button onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : !selectedProjectId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Select a project to view the financial report.
            </p>
          </CardContent>
        </Card>
      ) : financialData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FinancialSummaryCard 
              title="Original Budget"
              value={financialData.metrics.originalBudget}
              description="Initial project budget"
              icon="DollarSign"
              positive
            />
            <FinancialSummaryCard 
              title="Change Orders Impact"
              value={financialData.metrics.totalChangeOrderAmount}
              description="Financial impact from approved changes"
              icon="FileText"
              positive={financialData.metrics.totalChangeOrderAmount >= 0}
            />
            <FinancialSummaryCard 
              title="Current Budget"
              value={financialData.metrics.currentBudget}
              description="Original budget + approved changes"
              icon="Calculator"
              positive
            />
            <FinancialSummaryCard 
              title="Total Expenses"
              value={financialData.metrics.totalExpenses}
              description="Current expenditure"
              icon="CreditCard"
              neutral
            />
            <FinancialSummaryCard 
              title="Remaining Budget"
              value={financialData.metrics.remainingBudget}
              description="Budget remaining"
              icon="Wallet"
              positive={financialData.metrics.remainingBudget >= 0}
            />
            <FinancialSummaryCard 
              title="Budget Utilization"
              value={financialData.metrics.budgetUtilization}
              percentage
              description="Percentage of budget used"
              icon="PieChart"
              neutral
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Budget Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Estimated</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData.budgetItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No budget items found for this project.
                      </TableCell>
                    </TableRow>
                  ) : (
                    financialData.budgetItems.map((item) => {
                      const variance = (item.estimated_amount || 0) - (item.actual_amount || 0);
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell>{item.description || '-'}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.estimated_amount || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.actual_amount || 0)}
                          </TableCell>
                          <TableCell className={`text-right ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(variance)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Schedule Impact</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Approved Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData.changeOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No change orders found for this project.
                      </TableCell>
                    </TableRow>
                  ) : (
                    financialData.changeOrders.map((co) => (
                      <TableRow key={co.id}>
                        <TableCell className="font-medium">{co.title}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            co.status === 'APPROVED' || co.status === 'IMPLEMENTED' 
                              ? 'bg-green-100 text-green-800'
                              : co.status === 'REJECTED' || co.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>{co.status}</span>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(co.total_amount || 0)}</TableCell>
                        <TableCell className="text-right">{co.impact_days || 0} days</TableCell>
                        <TableCell>{new Date(co.requested_date).toLocaleDateString()}</TableCell>
                        <TableCell>{co.approved_date ? new Date(co.approved_date).toLocaleDateString() : '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default ProjectFinancialReport;
