
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DocumentsTableHeader = () => {
  return (
    <TableHeader className="bg-[#0485ea]/10">
      <TableRow>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">File Name</TableHead>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Category</TableHead>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Date Added</TableHead>
        <TableHead className="font-montserrat font-semibold text-[#0485ea]">Size</TableHead>
        <TableHead className="text-right font-montserrat font-semibold text-[#0485ea]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default DocumentsTableHeader;
