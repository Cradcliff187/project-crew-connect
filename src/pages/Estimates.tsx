
import { useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import EstimateDetails from '@/components/estimates/EstimateDetails';
import EstimatesTable, { EstimateType } from '@/components/estimates/EstimatesTable';
import EstimatesHeader from '@/components/estimates/EstimatesHeader';
import { useEstimates } from '@/components/estimates/hooks/useEstimates';
import { useEstimateDetails } from '@/components/estimates/hooks/useEstimateDetails';
import { useToast } from '@/hooks/use-toast';

const Estimates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateType | null>(null);
  const { toast } = useToast();
  
  const { estimates, loading, fetchEstimates } = useEstimates();
  const { 
    estimateItems, 
    estimateRevisions,
    estimateDocuments,
    fetchEstimateDetails,
    setEstimateItems,
    setEstimateRevisions,
    refetchAll
  } = useEstimateDetails();
  
  const handleViewEstimate = (estimate: EstimateType) => {
    setSelectedEstimate(estimate);
    console.log(`Viewing estimate: ${estimate.id}`);
    
    try {
      fetchEstimateDetails(estimate.id);
    } catch (error) {
      console.error("Error fetching estimate details:", error);
      toast({
        title: "Error",
        description: "Failed to load estimate details. Please try again.",
        variant: "destructive"
      });
    }
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
  
  console.log('Estimates page rendering with:', {
    estimatesCount: estimates.length,
    itemsCount: estimateItems.length,
    revisionsCount: estimateRevisions.length,
    documentsCount: estimateDocuments.length,
    selectedEstimateId: selectedEstimate?.id
  });
  
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
          documents={estimateDocuments}
          open={!!selectedEstimate}
          onClose={closeEstimateDetails}
        />
      )}
    </PageTransition>
  );
};

export default Estimates;
