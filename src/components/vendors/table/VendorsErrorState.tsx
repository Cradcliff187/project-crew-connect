
import { AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface VendorsErrorStateProps {
  error: string;
}

const VendorsErrorState = ({ error }: VendorsErrorStateProps) => {
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
            <TableCell colSpan={6} className="text-center py-8">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                <h3 className="font-semibold text-lg mb-1">Error Loading Vendors</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-[#0485ea] text-[#0485ea] hover:bg-[#0485ea] hover:text-white"
                >
                  Try Again
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default VendorsErrorState;
