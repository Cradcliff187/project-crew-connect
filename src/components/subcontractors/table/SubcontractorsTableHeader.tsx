
import { TableHead } from '@/components/ui/table';
import { Tag } from 'lucide-react';

const SubcontractorsTableHeader = () => {
  return (
    <>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Name</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">
        <div className="flex items-center gap-1">
          <Tag className="h-4 w-4" />
          <span>Specialties</span>
        </div>
      </TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Contact</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Location</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Status</TableHead>
      <TableHead className="text-right font-montserrat font-semibold text-[#0485ea]">Actions</TableHead>
    </>
  );
};

export default SubcontractorsTableHeader;
