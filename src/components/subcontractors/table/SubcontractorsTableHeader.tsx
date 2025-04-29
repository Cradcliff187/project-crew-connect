import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tag } from 'lucide-react';

const SubcontractorsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Specialties</TableHead>
        <TableHead>Contact</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default SubcontractorsTableHeader;
