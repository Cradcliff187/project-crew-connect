
import { format } from 'date-fns';

interface ExportData {
  projectName: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  financialMetrics: {
    totalBudget: number;
    expensesTotal: number;
    laborCost: number;
    materialsCost: number;
    changeOrdersTotal: number;
    remainingBudget: number;
    variance: number;
    variancePercent: number;
  };
  monthlyData?: {
    month: string;
    expenses: number;
    budget?: number;
  }[];
}

export const exportProjectFinancialCSV = (data: ExportData): void => {
  // Format the date range for the filename
  const fromDate = format(data.dateRange.from, 'yyyyMMdd');
  const toDate = format(data.dateRange.to, 'yyyyMMdd');
  
  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add header
  csvContent += "AKC LLC - Project Financial Report\r\n\r\n";
  csvContent += `Project: ${data.projectName}\r\n`;
  csvContent += `Period: ${data.dateRange.from.toLocaleDateString()} to ${data.dateRange.to.toLocaleDateString()}\r\n\r\n`;
  
  // Add financial metrics
  csvContent += "Financial Metrics\r\n";
  csvContent += "Metric,Value\r\n";
  csvContent += `Total Budget,${data.financialMetrics.totalBudget}\r\n`;
  csvContent += `Current Expenses,${data.financialMetrics.expensesTotal}\r\n`;
  csvContent += `Remaining Budget,${data.financialMetrics.remainingBudget}\r\n`;
  csvContent += `Budget Variance,${data.financialMetrics.variancePercent.toFixed(1)}%\r\n`;
  csvContent += `Labor Cost,${data.financialMetrics.laborCost}\r\n`;
  csvContent += `Materials Cost,${data.financialMetrics.materialsCost}\r\n`;
  csvContent += `Change Orders,${data.financialMetrics.changeOrdersTotal}\r\n\r\n`;
  
  // Add monthly data if available
  if (data.monthlyData && data.monthlyData.length > 0) {
    csvContent += "Monthly Expenses\r\n";
    
    // Add header row with additional columns for budget and variance
    csvContent += "Month,Expenses,Budget,Variance\r\n";
    
    data.monthlyData.forEach(item => {
      const budget = item.budget || 0;
      const variance = item.budget ? item.budget - item.expenses : 0;
      csvContent += `${item.month},${item.expenses},${budget},${variance}\r\n`;
    });
  }
  
  // Create download link and trigger download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${data.projectName.replace(/\s+/g, '_')}_Financial_Report_${fromDate}_${toDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
