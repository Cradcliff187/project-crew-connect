import { Plus, Search, ChevronDown, Filter, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EstimateMultiStepForm from './EstimateMultiStepForm';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/common/layout/PageHeader';

interface EstimatesHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onEstimateAdded: () => void;
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
    onEstimateAdded();
  };

  return (
    <>
      <PageHeader
        title="Estimates"
        subtitle="Create and manage client estimates"
        actions={
          <>
            <div className="relative w-full md:w-auto flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search estimates..."
                className="pl-9 subtle-input rounded-md"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4 mr-1" />
                Filter
                <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
              </Button>

              <Link to="/estimates/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Email Settings
                </Button>
              </Link>

              <Button
                onClick={openEstimateForm}
                size="sm"
                className="bg-[#0485ea] hover:bg-[#0373ce]"
              >
                <Plus className="h-4 w-4 mr-1" />
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
