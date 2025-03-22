
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const ExpensesTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Expense</TableHead>
        <TableHead>Vendor</TableHead>
        <TableHead>Quantity</TableHead>
        <TableHead>Unit Price</TableHead>
        <TableHead>Total</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ExpensesTableHeader;
