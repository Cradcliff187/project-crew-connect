import { HardHat } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface SubcontractorsEmptyStateProps {
  searchQuery: string;
}

const SubcontractorsEmptyState = ({ searchQuery }: SubcontractorsEmptyStateProps) => {
  const isFiltered = searchQuery.length > 0;

  return (
    <EmptyState
      icon={<HardHat className="h-12 w-12 text-muted-foreground/50" />}
      title={isFiltered ? 'No subcontractors match your search' : 'No subcontractors yet'}
      description={
        isFiltered
          ? `There are no subcontractors matching "${searchQuery}". Try another search term.`
          : 'Start by adding your first subcontractor!'
      }
    />
  );
};

export default SubcontractorsEmptyState;
