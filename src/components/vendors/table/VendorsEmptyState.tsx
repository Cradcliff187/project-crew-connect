
import { Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface VendorsEmptyStateProps {
  searchQuery: string;
}

const VendorsEmptyState = ({ searchQuery }: VendorsEmptyStateProps) => {
  const message = searchQuery
    ? `No vendors found matching "${searchQuery}"`
    : 'No vendors found. Add your first vendor!';

  return (
    <div className="rounded-md border shadow-sm animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader className="bg-[#0485ea]/10">
          <TableRow>
            <TableHead className="font-montserrat font-semibold text-[#0485ea]">Vendor</TableHead>
            <TableHead className="font-montserrat font-semibold text-[#0485ea]">Contact</TableHead>
            <TableHead className="font-montserrat font-semibold text-[#0485ea]">Location</TableHead>
            <TableHead className="font-montserrat font-semibold text-[#0485ea]">Added</TableHead>
            <TableHead className="font-montserrat font-semibold text-[#0485ea]">Status</TableHead>
            <TableHead className="text-right font-montserrat font-semibold text-[#0485ea]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="h-52 text-center">
              <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
                <Package className="h-12 w-12 mb-2 text-muted-foreground/50" />
                <p>{message}</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default VendorsEmptyState;
