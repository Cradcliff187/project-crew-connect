
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderExpense } from '@/types/workOrder';
import { ExpensesTableContent } from './components';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

interface ExpensesTableProps {
  expenses: WorkOrderExpense[];
  loading: boolean;
  vendors: { vendorid: string, vendorname: string }[];
  onDelete: (id: string) => Promise<void>;
  onReceiptUploaded: (expenseId: string, documentId: string) => Promise<void>;
  totalCost: number;
  workOrderId: string;
  onReceiptClick: (expense: WorkOrderExpense) => void;
}

const ExpensesTable = ({ 
  expenses, 
  loading, 
  vendors, 
  onDelete, 
  onReceiptUploaded, 
  totalCost,
  workOrderId,
  onReceiptClick
}: ExpensesTableProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  return (
    <Card className="shadow-sm border-[#0485ea]/10">
      <CardContent className="p-0">
        <ExpensesTableContent 
          expenses={expenses} 
          vendors={vendors} 
          onDelete={onDelete}
          onReceiptClick={onReceiptClick}
        />
        
        {expenses.length > 0 ? (
          <div className="flex justify-between items-center bg-gray-50 p-4 border-t">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign size={18} />
              <span className="font-medium">Total Items: {expenses.length}</span>
            </div>
            <div className="bg-[#0485ea]/10 px-4 py-2 rounded-md flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Total Expenses Cost:</span>
              <span className="text-lg font-bold text-[#0485ea]">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default ExpensesTable;
