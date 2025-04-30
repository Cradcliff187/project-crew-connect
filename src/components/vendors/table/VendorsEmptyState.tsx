import { Button } from '@/components/ui/button';
import { FileX2, Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';

interface VendorsEmptyStateProps {
  searchQuery: string;
}

const VendorsEmptyState = ({ searchQuery }: VendorsEmptyStateProps) => {
  const isFiltered = searchQuery.length > 0;

  return (
    <EmptyState
      icon={<FileX2 className="h-10 w-10 text-muted-foreground/50" />}
      title={isFiltered ? 'No vendors match your search' : 'No vendors yet'}
      description={
        isFiltered
          ? `There are no vendors matching "${searchQuery}". Try another search term.`
          : 'Start by adding your first vendor.'
      }
    >
      {!isFiltered && (
        <Button>
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
          Add Your First Vendor
        </Button>
      )}
    </EmptyState>
  );
};

export default VendorsEmptyState;
