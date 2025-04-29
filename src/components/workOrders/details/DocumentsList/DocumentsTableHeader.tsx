import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DocumentsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>File Name</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Date Added</TableHead>
        <TableHead>Size</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default DocumentsTableHeader;
