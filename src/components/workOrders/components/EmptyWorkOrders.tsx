import { TableRow, TableCell } from '@/components/ui/table';

const EmptyWorkOrders = () => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
        No work orders found that match your criteria
      </TableCell>
    </TableRow>
  );
};

export default EmptyWorkOrders;
