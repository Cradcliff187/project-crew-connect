import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, FileText } from 'lucide-react';
import { Expense } from '../hooks/useProjectExpenses';
import { formatCurrency, formatDate } from '@/lib/utils';
import { formatTime } from '@/utils/time/timeUtils';
import ExpenseDetailModal from './ExpenseDetailModal';

interface ExpensesTableProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onViewDocument: (documentId: string) => void;
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  onEditExpense,
  onDeleteExpense,
  onViewDocument,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No expenses recorded. Click 'Add Expense' to create one.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Document</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense: Expense) => (
            <TableRow
              key={expense.id}
              onClick={() => handleRowClick(expense)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell>{formatDate(expense.expense_date)}</TableCell>
              <TableCell>
                {expense.description}
                {expense.expense_type === 'LABOR' && expense.hours_worked && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({expense.hours_worked?.toFixed(1)} hrs)
                  </span>
                )}
              </TableCell>
              <TableCell>
                {expense.expense_type === 'LABOR' ? (
                  <Badge variant="secondary">Labor</Badge>
                ) : expense.budget_item_category ? (
                  <Badge variant="outline">{expense.budget_item_category}</Badge>
                ) : (
                  <span className="text-muted-foreground italic">Uncategorized</span>
                )}
              </TableCell>
              <TableCell>{expense.vendor_name || 'N/A'}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(expense.amount)}
              </TableCell>
              <TableCell>
                {expense.document_id ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={e => {
                      e.stopPropagation();
                      onViewDocument(expense.document_id!);
                    }}
                  >
                    <FileText className="h-4 w-4 text-blue-500" />
                  </Button>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={e => {
                      e.stopPropagation();
                      onEditExpense(expense);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteExpense(expense);
                    }}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ExpenseDetailModal
        expense={selectedExpense}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewDocument={onViewDocument}
      />
    </>
  );
};

export default ExpensesTable;
