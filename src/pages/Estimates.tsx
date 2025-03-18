
import { useState } from 'react';
import { Search, Filter, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageTransition from '@/components/layout/PageTransition';
import PageHeader from '@/components/layout/PageHeader';
import EstimateDetails from '@/components/estimates/EstimateDetails';
import EstimateForm from '@/components/estimates/EstimateForm';
import EstimatesTable, { EstimateType } from '@/components/estimates/EstimatesTable';
import { useEstimates } from '@/components/estimates/hooks/useEstimates';
import { useEstimateDetails } from '@/components/estimates/hooks/useEstimateDetails';

const Estimates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateType | null>(null);
  const [showNewEstimateForm, setShowNewEstimateForm] = useState(false);
  
  const { estimates, loading, fetchEstimates } = useEstimates();
  const { 
    estimateItems, 
    estimateRevisions, 
    fetchEstimateDetails,
    setEstimateItems,
    setEstimateRevisions
  } = useEstimateDetails();
  
  const handleViewEstimate = (estimate: EstimateType) => {
    setSelectedEstimate(estimate);
    fetchEstimateDetails(estimate.id);
  };
  
  const closeEstimateDetails = () => {
    setSelectedEstimate(null);
    setEstimateItems([]);
    setEstimateRevisions([]);
    fetchEstimates(); // Refresh the list when the dialog is closed
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const handleCreateNewEstimate = () => {
    setShowNewEstimateForm(true);
  };

  const handleCloseNewEstimateForm = () => {
    setShowNewEstimateForm(false);
    fetchEstimates(); // Refresh the list after creating a new estimate
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
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
        
        <EstimatesTable 
          estimates={estimates}
          loading={loading}
          searchQuery={searchQuery}
          onViewEstimate={handleViewEstimate}
          formatDate={formatDate}
        />
      </div>
      
      {selectedEstimate && (
        <EstimateDetails 
          estimate={selectedEstimate}
          items={estimateItems}
          revisions={estimateRevisions}
          open={!!selectedEstimate}
          onClose={closeEstimateDetails}
        />
      )}

      <EstimateForm 
        open={showNewEstimateForm} 
        onClose={handleCloseNewEstimateForm}
      />
    </PageTransition>
  );
};

export default Estimates;
