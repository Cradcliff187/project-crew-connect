
import { Table } from '@/components/ui/table';
import { WorkOrderExpense } from '@/types/workOrder';
import { ExpensesTableHeader, ExpensesTableBody } from './table';
import { Card, CardContent } from '@/components/ui/card';

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
    <Card className="shadow-sm border-[#0485ea]/10">
      <CardContent className="p-0">
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
      </CardContent>
    </Card>
  );
};

export default ExpensesTableContent;
