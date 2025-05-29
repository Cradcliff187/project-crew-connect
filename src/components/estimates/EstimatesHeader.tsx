import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { FilterButton } from '@/components/ui/filter-button';
import EstimateMultiStepForm from './EstimateMultiStepForm';
import { useState } from 'react';
import { Link } from 'react-router-dom';

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
      {/* Clean Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <SearchInput
          placeholder="Search estimates..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          containerClassName="w-full sm:w-auto flex-1 max-w-md"
        />

        <div className="flex items-center gap-2">
          <FilterButton />

          <Link to="/estimates/settings">
            <Button variant="outline" size="sm" className="font-opensans">
              <Settings className="h-4 w-4 mr-1" aria-hidden="true" />
              Email Settings
            </Button>
          </Link>

          <Button
            onClick={openEstimateForm}
            size="sm"
            variant="default"
            className="bg-[#0485ea] hover:bg-[#0375d1] font-opensans"
          >
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            New Estimate
          </Button>
        </div>
      </div>

      <EstimateMultiStepForm open={estimateFormOpen} onClose={closeEstimateForm} />
    </>
  );
};

export default EstimatesHeader;
