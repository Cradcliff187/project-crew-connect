
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderExpense } from '@/types/workOrder';
import { ReceiptButton } from '../';

interface ExpenseTableRowProps {
  expense: WorkOrderExpense;
  vendorName: string;
  onDelete: (id: string) => Promise<void>;
  onReceiptClick: (expense: WorkOrderExpense) => void;
}

const ExpenseTableRow = ({
  expense,
  vendorName,
  onDelete,
  onReceiptClick
}: ExpenseTableRowProps) => {
  return (
    <TableRow className="hover:bg-[#0485ea]/5 transition-colors">
      <TableCell className="font-medium">{expense.expense_name}</TableCell>
      <TableCell>{vendorName || 'No vendor specified'}</TableCell>
      <TableCell>{expense.quantity}</TableCell>
      <TableCell>{formatCurrency(expense.unit_price)}</TableCell>
      <TableCell className="font-semibold">{formatCurrency(expense.total_price)}</TableCell>
      <TableCell className="flex items-center justify-end gap-2">
        <ReceiptButton 
          expense={expense} 
          onClick={onReceiptClick} 
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(expense.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ExpenseTableRow;
