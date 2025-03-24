
import { TableHead } from '@/components/ui/table';

const SubcontractorsTableHeader = () => {
  return (
    <>
      <TableHead>Name</TableHead>
      <TableHead>Contact</TableHead>
      <TableHead>Location</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </>
  );
};

export default SubcontractorsTableHeader;
