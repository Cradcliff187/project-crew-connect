
import { TableRow, TableCell } from '@/components/ui/table';
import { Trash2, Upload, FileText, Edit, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { WorkOrderExpense } from '@/types/workOrder';
import ActionMenu, { ActionItem, ActionGroup } from '@/components/ui/action-menu';

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
  const isTimeEntryExpense = expense.source_type === 'time_entry';
  
  // Define actions for the menu based on expense type and receipt status
  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          label: expense.receipt_document_id ? "View Receipt" : "Upload Receipt",
          icon: expense.receipt_document_id ? <FileText className="h-4 w-4" /> : <Upload className="h-4 w-4" />,
          onClick: () => onReceiptClick(expense),
          className: expense.receipt_document_id 
            ? "text-green-600 hover:text-green-700" 
            : "text-blue-600 hover:text-blue-700"
        },
        ...(!isTimeEntryExpense ? [{
          label: "Edit Expense",
          icon: <Edit className="h-4 w-4" />,
          onClick: () => console.log("Edit expense:", expense.id),
          className: "text-gray-600 hover:text-gray-800"
        }] : [])
      ]
    },
    {
      items: [
        ...(isTimeEntryExpense ? [{
          label: "View Time Entry",
          icon: <Clock className="h-4 w-4" />,
          onClick: () => console.log("View time entry:", expense.time_entry_id),
          className: "text-indigo-600 hover:text-indigo-700"
        }] : []),
        ...(!isTimeEntryExpense ? [{
          label: "Delete",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => onDelete(expense.id),
          className: "text-red-500 hover:text-red-700"
        }] : [])
      ]
    }
  ];

  return (
    <TableRow className="hover:bg-[#0485ea]/5 transition-colors">
      <TableCell className="font-medium">
        {expense.expense_name}
        {isTimeEntryExpense && (
          <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
            Time Entry
          </span>
        )}
      </TableCell>
      <TableCell>{vendorName || 'No vendor specified'}</TableCell>
      <TableCell>{expense.quantity}</TableCell>
      <TableCell>{formatCurrency(expense.unit_price)}</TableCell>
      <TableCell className="font-semibold">{formatCurrency(expense.total_price)}</TableCell>
      <TableCell className="text-right">
        <ActionMenu 
          groups={actionGroups}
          size="sm"
          align="end"
          triggerClassName="ml-auto"
        />
      </TableCell>
    </TableRow>
  );
};

export default ExpenseTableRow;
