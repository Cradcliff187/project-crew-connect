
import { useState } from 'react';
import { WorkOrderExpense } from '@/types/workOrder';
import { ExpensesTable } from '..';
import { SectionHeader, AddExpenseSheet } from './header';

interface ExpensesInfoSectionProps {
  expenses: WorkOrderExpense[];
  loading: boolean;
  submitting: boolean;
  vendors: { vendorid: string, vendorname: string }[];
  totalExpensesCost: number;
  workOrderId: string;
  onExpensePrompt: (expenseData: any) => void;
  onDelete: (id: string) => Promise<void>;
  onReceiptAttached: (expenseId: string, documentId: string) => Promise<void>;
  onVendorAdded: () => void;
  onReceiptClick: (expense: WorkOrderExpense) => void;
}

const ExpensesInfoSection = ({
  expenses,
  loading,
  submitting,
  vendors,
  totalExpensesCost,
  workOrderId,
  onExpensePrompt,
  onDelete,
  onReceiptAttached,
  onVendorAdded,
  onReceiptClick
}: ExpensesInfoSectionProps) => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <SectionHeader onAddClick={() => setShowAddForm(true)} />
      
      {/* Expenses Table */}
      <ExpensesTable
        expenses={expenses}
        loading={loading}
        vendors={vendors}
        onDelete={onDelete}
        onReceiptUploaded={onReceiptAttached}
        totalCost={totalExpensesCost}
        workOrderId={workOrderId}
        onReceiptClick={onReceiptClick}
      />
      
      {/* Add Expense Sheet */}
      <AddExpenseSheet
        open={showAddForm}
        onOpenChange={setShowAddForm}
        workOrderId={workOrderId}
        vendors={vendors}
        submitting={submitting}
        onExpensePrompt={onExpensePrompt}
        onVendorAdded={onVendorAdded}
        onSuccess={() => setShowAddForm(false)}
      />
    </div>
  );
};

export default ExpensesInfoSection;
