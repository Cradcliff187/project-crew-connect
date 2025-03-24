
import { TableHead } from '@/components/ui/table';

const SubcontractorsTableHeader = () => {
  return (
    <>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Name</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Specialties</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Contact</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Location</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Details</TableHead>
      <TableHead className="font-montserrat font-semibold text-[#0485ea]">Status</TableHead>
      <TableHead className="text-right font-montserrat font-semibold text-[#0485ea]">Actions</TableHead>
    </>
  );
};

export default SubcontractorsTableHeader;
