import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Download, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FinancialSummaryCard from './components/FinancialSummaryCard';
import ReportFilters from './components/ReportFilters';
import ProjectFinancialChart from './components/ProjectFinancialChart';
import MonthlyExpenditureChart from './components/MonthlyExpenditureChart';
import { exportProjectFinancialPDF } from './utils/pdfExport';
import { exportProjectFinancialCSV } from './utils/csvExport';

// Financial report types & interfaces
interface FinancialReportProps {
  projectId?: string;
}

interface ProjectOption {
  projectid: string;
  projectname: string;
}

interface FinancialMetrics {
  totalBudget: number;
  expensesTotal: number;
  laborCost: number;
  materialsCost: number;
  changeOrdersTotal: number;
  remainingBudget: number;
  variance: number;
  variancePercent: number;
}

interface MonthlyData {
  month: string;
  expenses: number;
  budget: number;
}

const defaultMetrics: FinancialMetrics = {
  totalBudget: 0,
  expensesTotal: 0,
  laborCost: 0,
  materialsCost: 0,
  changeOrdersTotal: 0,
  remainingBudget: 0,
  variance: 0,
  variancePercent: 0
};

const ProjectFinancialReport: React.FC<FinancialReportProps> = ({ projectId: initialProjectId }) => {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(initialProjectId);
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
  const [projectsList, setProjectsList] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<FinancialMetrics>(defaultMetrics);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 3),
    to: new Date()
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('projectid, projectname')
        .order('projectname');

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      setProjectsList(data || []);
      
      // If no initial project and we have projects, select the first one
      if (!selectedProjectId && data && data.length > 0) {
        setSelectedProjectId(data[0].projectid);
      }
    };

    fetchProjects();
  }, []);

  // Update selectedProject when projectId or projectsList changes
  useEffect(() => {
    if (selectedProjectId && projectsList.length > 0) {
      const project = projectsList.find(p => p.projectid === selectedProjectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [selectedProjectId, projectsList]);

  // Fetch financial metrics when project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    
    const fetchFinancialData = async () => {
      setLoading(true);
      
      try {
        // Fetch project budget
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('total_budget, current_expenses')
          .eq('projectid', selectedProjectId)
          .single();
          
        if (projectError) throw projectError;

        // Fetch materials cost - using expenses table filtered by material type
        const { data: materialsData, error: materialsError } = await supabase
          .from('expenses')
          .select('amount')
          .eq('entity_id', selectedProjectId)
          .eq('entity_type', 'PROJECT')
          .eq('expense_type', 'MATERIAL');
          
        if (materialsError) throw materialsError;

        // Fetch labor cost from time_entries
        const { data: timeEntriesData, error: timeEntriesError } = await supabase
          .from('time_entries')
          .select('hours_worked, employee_rate')
          .eq('entity_id', selectedProjectId)
          .eq('entity_type', 'PROJECT');
          
        if (timeEntriesError) throw timeEntriesError;

        // Fetch change orders
        const { data: changeOrdersData, error: changeOrdersError } = await supabase
          .from('change_orders')
          .select('total_amount')
          .eq('entity_id', selectedProjectId)
          .eq('entity_type', 'PROJECT');
          
        if (changeOrdersError) throw changeOrdersError;

        // Calculate metrics
        const totalBudget = projectData?.total_budget || 0;
        const expensesTotal = projectData?.current_expenses || 0;
        
        const materialsCost = materialsData?.reduce((total, item) => {
          return total + item.amount;
        }, 0) || 0;
        
        const laborCost = timeEntriesData?.reduce((total, item) => {
          return total + (item.hours_worked * (item.employee_rate || 0));
        }, 0) || 0;
        
        const changeOrdersTotal = changeOrdersData?.reduce((total, item) => {
          return total + (item.total_amount || 0);
        }, 0) || 0;
        
        const remainingBudget = totalBudget - expensesTotal;
        const variance = remainingBudget;
        const variancePercent = totalBudget > 0 
          ? (remainingBudget / totalBudget) * 100 
          : 0;

        setMetrics({
          totalBudget,
          expensesTotal,
          laborCost,
          materialsCost,
          changeOrdersTotal,
          remainingBudget,
          variance,
          variancePercent
        });

        // Generate monthly data
        await fetchMonthlyExpenses(selectedProjectId, dateRange.from, dateRange.to);
      } catch (error) {
        console.error('Error fetching financial data:', error);
        toast({
          title: "Error loading financial data",
          description: "Could not retrieve project financial information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [selectedProjectId, dateRange]);

  // Fetch monthly expense data
  const fetchMonthlyExpenses = async (projectId: string, fromDate: Date, toDate: Date) => {
    try {
      // Create an array of months in the date range
      const months = eachMonthOfInterval({ start: fromDate, end: toDate });
      
      // Get total budget
      const { data: projectData } = await supabase
        .from('projects')
        .select('total_budget')
        .eq('projectid', projectId)
        .single();
      
      const totalBudget = projectData?.total_budget || 0;
      
      // Calculate monthly budget allocation (evenly distributed)
      const monthlyBudget = months.length > 0 ? totalBudget / months.length : 0;
      
      // Create a placeholder for each month with budget allocation
      const monthlyExpensesData: MonthlyData[] = months.map(date => ({
        month: format(date, 'MMM yyyy'),
        expenses: 0,
        budget: monthlyBudget
      }));

      // Fetch expense data grouped by month
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, created_at')
        .eq('entity_id', projectId)
        .eq('entity_type', 'PROJECT')
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString());

      if (expensesError) throw expensesError;
      
      // Aggregate expenses by month
      if (expensesData && expensesData.length > 0) {
        expensesData.forEach(expense => {
          const expenseDate = new Date(expense.created_at);
          const monthIndex = months.findIndex(month => 
            expenseDate >= startOfMonth(month) && 
            expenseDate <= endOfMonth(month)
          );
          
          if (monthIndex >= 0) {
            monthlyExpensesData[monthIndex].expenses += expense.amount;
          }
        });
      }
      
      setMonthlyData(monthlyExpensesData);
    } catch (error) {
      console.error('Error fetching monthly expenses:', error);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleExportPDF = () => {
    if (!selectedProject) {
      toast({
        title: "Export failed",
        description: "No project selected",
        variant: "destructive"
      });
      return;
    }

    try {
      exportProjectFinancialPDF({
        projectName: selectedProject.projectname,
        dateRange: dateRange,
        financialMetrics: metrics,
        monthlyData: monthlyData
      });
      
      toast({
        title: "Export successful",
        description: "PDF report has been downloaded",
        variant: "default"
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export failed",
        description: "Could not generate PDF report",
        variant: "destructive"
      });
    }
  };

  const handleExportCSV = () => {
    if (!selectedProject) {
      toast({
        title: "Export failed",
        description: "No project selected",
        variant: "destructive"
      });
      return;
    }

    try {
      exportProjectFinancialCSV({
        projectName: selectedProject.projectname,
        dateRange: dateRange,
        financialMetrics: metrics,
        monthlyData: monthlyData
      });
      
      toast({
        title: "Export successful",
        description: "CSV report has been downloaded",
        variant: "default"
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Export failed",
        description: "Could not generate CSV report",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-auto">
          <Select 
            value={selectedProjectId} 
            onValueChange={handleProjectChange}
            disabled={loading || projectsList.length === 0}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projectsList.map((project) => (
                <SelectItem key={project.projectid} value={project.projectid}>
                  {project.projectname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || !selectedProject}
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          
          <Button 
            size="sm" 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={handleExportPDF}
            disabled={loading || !selectedProject}
          >
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
        </div>
      </div>

      {showFilters && (
        <ReportFilters 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinancialSummaryCard
          title="Total Budget"
          value={metrics.totalBudget}
          description="Total allocated budget"
          icon="DollarSign"
          neutral
        />
        <FinancialSummaryCard
          title="Current Expenses"
          value={metrics.expensesTotal}
          description="Total expenses to date"
          icon="CreditCard"
        />
        <FinancialSummaryCard
          title="Remaining Budget"
          value={metrics.remainingBudget}
          description="Available budget"
          icon="Wallet"
          positive={metrics.remainingBudget >= 0}
        />
        <FinancialSummaryCard
          title="Budget Variance"
          value={metrics.variancePercent}
          description={metrics.variance >= 0 ? "Under budget" : "Over budget"}
          icon={metrics.variance >= 0 ? "TrendingUp" : "TrendingDown"}
          percentage
          positive={metrics.variance >= 0}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-base font-medium mb-4">Budget vs. Expenses</h3>
              <div className="h-[300px]">
                <ProjectFinancialChart 
                  budget={metrics.totalBudget} 
                  expenses={metrics.expensesTotal} 
                  loading={loading} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-base font-medium mb-4">Expense Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Labor</span>
                  <span>{metrics.expensesTotal > 0 ? ((metrics.laborCost / metrics.expensesTotal) * 100).toFixed(1) : "0"}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-[#0485ea] h-2.5 rounded-full" 
                    style={{ width: metrics.expensesTotal > 0 ? `${(metrics.laborCost / metrics.expensesTotal) * 100}%` : '0%' }}
                  ></div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Materials</span>
                  <span>{metrics.expensesTotal > 0 ? ((metrics.materialsCost / metrics.expensesTotal) * 100).toFixed(1) : "0"}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: metrics.expensesTotal > 0 ? `${(metrics.materialsCost / metrics.expensesTotal) * 100}%` : '0%' }}
                  ></div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Change Orders</span>
                  <span>{metrics.expensesTotal > 0 ? ((metrics.changeOrdersTotal / metrics.expensesTotal) * 100).toFixed(1) : "0"}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className="bg-orange-500 h-2.5 rounded-full" 
                    style={{ width: metrics.expensesTotal > 0 ? `${(metrics.changeOrdersTotal / metrics.expensesTotal) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-base font-medium mb-4">Monthly Expenditure</h3>
          <MonthlyExpenditureChart 
            data={monthlyData} 
            loading={loading} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectFinancialReport;
