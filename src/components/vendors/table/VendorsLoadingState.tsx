
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const VendorsLoadingState = () => {
  return (
    <div className="rounded-md border shadow-sm animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader className="bg-[#0485ea]/10">
          <TableRow>
            <TableHead className="font-montserrat font-semibold text-[#0485ea]">Vendor</TableHead>
            <TableHead className="font-montserrat font-semibold text-[#0485ea]">Contact</TableHead>
            <TableHead className="font-montserrat font-semibold text-[#0485ea]">Location</TableHead>
            <TableHead className="font-montserrat font-semibold text-[#0485ea]">Payment Terms</TableHead>
            <TableHead className="font-montserrat font-semibold text-[#0485ea]">Status</TableHead>
            <TableHead className="text-right font-montserrat font-semibold text-[#0485ea]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-8 w-8 rounded-full ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VendorsLoadingState;
