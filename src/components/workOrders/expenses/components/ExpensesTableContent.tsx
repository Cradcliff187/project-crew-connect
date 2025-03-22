
import { Table } from '@/components/ui/table';
import { WorkOrderExpense } from '@/types/workOrder';
import { ExpensesTableHeader, ExpensesTableBody } from './table';

interface ExpensesTableContentProps {
  expenses: WorkOrderExpense[];
  vendors: { vendorid: string, vendorname: string }[];
  onDelete: (id: string) => Promise<void>;
  onReceiptClick: (expense: WorkOrderExpense) => void;
}

const ExpensesTableContent = ({
  expenses,
  vendors,
  onDelete,
  onReceiptClick
}: ExpensesTableContentProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <ExpensesTableHeader />
        <ExpensesTableBody 
          expenses={expenses} 
          vendors={vendors} 
          onDelete={onDelete} 
          onReceiptClick={onReceiptClick}
        />
      </Table>
    </div>
  );
};

export default ExpensesTableContent;
