import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderExpense } from '@/types/workOrder';
import { ExpensesTableContent } from './components';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DollarSign, Info, ReceiptText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ExpensesTableProps {
  expenses: WorkOrderExpense[];
  loading: boolean;
  vendors: { vendorid: string; vendorname: string }[];
  onDelete: (id: string) => Promise<void>;
  onReceiptUploaded: (expenseId: string, documentId: string) => Promise<void>;
  totalCost: number;
  workOrderId: string;
  onReceiptClick: (expense: WorkOrderExpense) => void;
  onAddExpenseClick: () => void;
}

const ExpensesTable = ({
  expenses,
  loading,
  vendors,
  onDelete,
  onReceiptUploaded,
  totalCost,
  workOrderId,
  onReceiptClick,
  onAddExpenseClick,
}: ExpensesTableProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Count expense types
  const materialExpenses = expenses.filter(e => e.source_type === 'material' || !e.source_type);
  const timeEntryExpenses = expenses.filter(e => e.source_type === 'time_entry');

  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Expenses ({expenses.length})</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onAddExpenseClick}>
            Add Expense
          </Button>
        </div>
      </CardHeader>
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
              <span className="font-medium">
                Total Items: {expenses.length}
                {timeEntryExpenses.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-2 inline-flex items-center">
                          <Info className="h-4 w-4 text-primary" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Materials: {materialExpenses.length}</p>
                        <p>Time Entry Receipts: {timeEntryExpenses.length}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </span>
            </div>
            <div className="bg-primary/10 px-4 py-2 rounded-md flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Total Expenses Cost:</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="border-t">
        <Alert className="w-full bg-blue-50 border-blue-200 mt-4">
          <AlertDescription className="flex items-start gap-2 text-blue-800">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              This section logs miscellaneous expenses related to the work order. Receipts can be
              uploaded here.
            </div>
          </AlertDescription>
        </Alert>
        <div className="bg-primary/10 px-4 py-2 rounded-md flex items-center gap-2 mt-4 ml-auto">
          <span className="text-sm font-medium text-gray-700">Total Expenses:</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(totalCost)}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExpensesTable;
