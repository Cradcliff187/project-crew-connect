
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/lib/utils';

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
  }[];
}

export const generateProjectFinancialPDF = (data: ExportData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(4, 133, 234); // #0485ea
  doc.text('AKC LLC - Financial Report', pageWidth / 2, 20, { align: 'center' });
  
  // Project name and date range
  doc.setFontSize(12);
  doc.setTextColor(51, 51, 51); // #333333
  doc.text(`Project: ${data.projectName}`, 14, 30);
  doc.text(
    `Period: ${data.dateRange.from.toLocaleDateString()} to ${data.dateRange.to.toLocaleDateString()}`, 
    14, 
    38
  );
  
  // Financial summary table
  autoTable(doc, {
    startY: 45,
    head: [['Metric', 'Value']],
    body: [
      ['Total Budget', formatCurrency(data.financialMetrics.totalBudget)],
      ['Current Expenses', formatCurrency(data.financialMetrics.expensesTotal)],
      ['Remaining Budget', formatCurrency(data.financialMetrics.remainingBudget)],
      ['Budget Variance', `${data.financialMetrics.variancePercent.toFixed(1)}%`],
      ['Labor Cost', formatCurrency(data.financialMetrics.laborCost)],
      ['Materials Cost', formatCurrency(data.financialMetrics.materialsCost)],
      ['Change Orders', formatCurrency(data.financialMetrics.changeOrdersTotal)],
    ],
    headStyles: {
      fillColor: [4, 133, 234], // #0485ea
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
  });
  
  // If monthly data is provided
  if (data.monthlyData && data.monthlyData.length > 0) {
    const startY = (doc as any).lastAutoTable.finalY + 20; // Get position after previous table
    
    doc.setFontSize(14);
    doc.setTextColor(4, 133, 234);
    doc.text('Monthly Expenses', 14, startY);
    
    autoTable(doc, {
      startY: startY + 5,
      head: [['Month', 'Expenses']],
      body: data.monthlyData.map(item => [
        item.month,
        formatCurrency(item.expenses)
      ]),
      headStyles: {
        fillColor: [4, 133, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
    });
  }
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  return doc;
};

export const exportProjectFinancialPDF = (data: ExportData): void => {
  const doc = generateProjectFinancialPDF(data);
  doc.save(`${data.projectName.replace(/\s+/g, '_')}_Financial_Report.pdf`);
};

