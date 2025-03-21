
import { useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import EstimateDetails from '@/components/estimates/EstimateDetails';
import EstimatesTable, { EstimateType } from '@/components/estimates/EstimatesTable';
import EstimatesHeader from '@/components/estimates/EstimatesHeader';
import { useEstimates } from '@/components/estimates/hooks/useEstimates';
import { useEstimateDetails } from '@/components/estimates/hooks/useEstimateDetails';

const Estimates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateType | null>(null);
  
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
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <EstimatesHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onEstimateAdded={fetchEstimates}
        />
        
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
    </PageTransition>
  );
};

export default Estimates;
