import { TableError } from '@/components/ui/table-error';

interface VendorsErrorStateProps {
  error: string;
}

const VendorsErrorState = ({ error }: VendorsErrorStateProps) => {
  return <TableError error={error} />;
};

export default VendorsErrorState;
