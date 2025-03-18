
import { useState } from 'react';
import { Search, Filter, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/layout/PageHeader';
import EstimateForm from './EstimateForm';

interface EstimatesHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onEstimateAdded: () => void;
}

const EstimatesHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  onEstimateAdded 
}: EstimatesHeaderProps) => {
  const [showNewEstimateForm, setShowNewEstimateForm] = useState(false);
  
  const handleCreateNewEstimate = () => {
    setShowNewEstimateForm(true);
  };

  const handleCloseNewEstimateForm = () => {
    setShowNewEstimateForm(false);
    onEstimateAdded(); // Refresh the list after creating a new estimate
  };

  return (
    <>
      <PageHeader
        title="Estimates"
        description="Create and manage your project estimates"
      >
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search estimates..." 
            className="pl-9 subtle-input rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4 mr-1" />
            Filter
            <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
          </Button>
          <Button 
            size="sm" 
            className="flex-1 md:flex-auto bg-[#0485ea] hover:bg-[#0373ce]"
            onClick={handleCreateNewEstimate}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Estimate
          </Button>
        </div>
      </PageHeader>

      <EstimateForm 
        open={showNewEstimateForm} 
        onClose={handleCloseNewEstimateForm}
      />
    </>
  );
};

export default EstimatesHeader;
