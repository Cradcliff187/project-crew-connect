import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

const ProjectTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Project</TableHead>
        <TableHead>Client</TableHead>
        <TableHead>Created</TableHead>
        <TableHead>Budget</TableHead>
        <TableHead>Progress</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProjectTableHeader;
