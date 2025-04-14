import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

const ExpensesTableHeader = () => {
  return (
    <TableHeader className="bg-[#0485ea]/10">
      <TableRow>
        <TableHead className="font-montserrat font-medium text-[#0485ea]">Expense</TableHead>
        <TableHead className="font-montserrat font-medium text-[#0485ea]">Vendor</TableHead>
        <TableHead className="font-montserrat font-medium text-[#0485ea]">Quantity</TableHead>
        <TableHead className="font-montserrat font-medium text-[#0485ea]">Unit Price</TableHead>
        <TableHead className="font-montserrat font-medium text-[#0485ea]">Total</TableHead>
        <TableHead className="text-right font-montserrat font-medium text-[#0485ea]">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ExpensesTableHeader;
