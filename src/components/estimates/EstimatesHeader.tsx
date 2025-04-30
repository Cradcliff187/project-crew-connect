import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { FilterButton } from '@/components/ui/filter-button';
import EstimateMultiStepForm from './EstimateMultiStepForm';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/layout/PageHeader';

interface EstimatesHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onEstimateAdded?: () => void;
}

const EstimatesHeader = ({
  searchQuery,
  setSearchQuery,
  onEstimateAdded,
}: EstimatesHeaderProps) => {
  const [estimateFormOpen, setEstimateFormOpen] = useState(false);

  const openEstimateForm = () => {
    setEstimateFormOpen(true);
  };

  const closeEstimateForm = () => {
    setEstimateFormOpen(false);
    if (onEstimateAdded) {
      onEstimateAdded();
    }
  };

  return (
    <>
      <PageHeader
        title="Estimates"
        subtitle="Create and manage client estimates"
        actions={
          <>
            <SearchInput
              placeholder="Search estimates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              containerClassName="w-full md:w-auto flex-1 max-w-sm"
            />

            <div className="flex items-center gap-2 w-full md:w-auto">
              <FilterButton />

              <Link to="/estimates/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" aria-hidden="true" />
                  Email Settings
                </Button>
              </Link>

              <Button onClick={openEstimateForm} size="sm" variant="default">
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                New Estimate
              </Button>
            </div>
          </>
        }
      />

      <EstimateMultiStepForm open={estimateFormOpen} onClose={closeEstimateForm} />
    </>
  );
};

export default EstimatesHeader;
