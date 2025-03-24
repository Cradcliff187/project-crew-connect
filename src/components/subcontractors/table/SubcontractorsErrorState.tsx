
import { AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface SubcontractorsErrorStateProps {
  error: string;
}

const SubcontractorsErrorState = ({ error }: SubcontractorsErrorStateProps) => {
  return (
    <div className="rounded-md border shadow-sm animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                <h3 className="font-semibold text-lg mb-1">Error Loading Subcontractors</h3>
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

export default SubcontractorsErrorState;
