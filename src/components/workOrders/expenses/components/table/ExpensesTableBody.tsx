import { TableBody } from '@/components/ui/table';
import { WorkOrderExpense } from '@/types/workOrder';
import ExpenseTableRow from './ExpenseTableRow';
import EmptyState from './EmptyState';

interface ExpensesTableBodyProps {
  expenses: WorkOrderExpense[];
  vendors: { vendorid: string; vendorname: string }[];
  onDelete: (id: string) => Promise<void>;
  onReceiptClick: (expense: WorkOrderExpense) => void;
}

const ExpensesTableBody = ({
  expenses,
  vendors,
  onDelete,
  onReceiptClick,
}: ExpensesTableBodyProps) => {
  // Find vendor name by ID
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return '';
    const vendor = vendors.find(v => v.vendorid === vendorId);
    return vendor ? vendor.vendorname : 'Unknown Vendor';
  };

  if (expenses.length === 0) {
    return <EmptyState />;
  }

  return (
    <TableBody>
      {expenses.map(expense => (
        <ExpenseTableRow
          key={expense.id}
          expense={expense}
          vendorName={getVendorName(expense.vendor_id)}
          onDelete={onDelete}
          onReceiptClick={onReceiptClick}
        />
      ))}
    </TableBody>
  );
};

export default ExpensesTableBody;
