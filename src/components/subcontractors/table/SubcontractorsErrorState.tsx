import { TableError } from '@/components/ui/table-error';

interface SubcontractorsErrorStateProps {
  error: string;
}

const SubcontractorsErrorState = ({ error }: SubcontractorsErrorStateProps) => {
  return <TableError error={error} />;
};

export default SubcontractorsErrorState;
