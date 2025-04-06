
import { useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import EstimateDetails from '@/components/estimates/EstimateDetails';
import EstimatesTable, { EstimateType } from '@/components/estimates/EstimatesTable';
import EstimatesHeader from '@/components/estimates/EstimatesHeader';
import { useEstimates } from '@/components/estimates/hooks/useEstimates';
import { useEstimateDetails } from '@/components/estimates/hooks/useEstimateDetails';
import { StatusType } from '@/types/common';
import { formatDate } from '@/lib/utils';

/**
 * Estimates page component for listing and managing estimates
 * Includes the estimates table and detail dialog for viewing estimate details
 */
const Estimates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateType | null>(null);
  
  const { estimates, loading, fetchEstimates } = useEstimates();
  const { 
    estimateItems, 
    estimateRevisions, 
    fetchEstimateDetails,
    setEstimateItems,
    setEstimateRevisions,
    isLoading: detailsLoading,
    refetchItems,
    refetchRevisions
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

  const handleStatusChange = () => {
    // Refresh both the estimate details and the main estimate list
    if (selectedEstimate) {
      fetchEstimateDetails(selectedEstimate.id);
      fetchEstimates();
    }
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <EstimatesHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onEstimateAdded={fetchEstimates}
        />
        
        <div className="mt-6">
          <EstimatesTable 
            estimates={estimates}
            loading={loading}
            searchQuery={searchQuery}
            onViewEstimate={handleViewEstimate}
            formatDate={formatDate}
            onRefreshEstimates={fetchEstimates}
          />
        </div>
      </div>
      
      {selectedEstimate && (
        <EstimateDetails 
          estimate={{
            id: selectedEstimate.id,
            customerId: selectedEstimate.customerId,
            client: selectedEstimate.client,
            project: selectedEstimate.project,
            date: selectedEstimate.date,
            status: selectedEstimate.status as StatusType,
            total: selectedEstimate.amount,
            description: selectedEstimate.description,
            versions: selectedEstimate.versions
          }}
          items={estimateItems}
          revisions={estimateRevisions}
          open={!!selectedEstimate}
          onClose={closeEstimateDetails}
          onStatusChange={handleStatusChange}
        />
      )}
    </PageTransition>
  );
};

export default Estimates;
