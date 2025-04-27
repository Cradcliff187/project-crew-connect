import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import EstimatesTable, { EstimateType } from '@/components/estimates/EstimatesTable';
import EstimatesHeader from '@/components/estimates/EstimatesHeader';
import { useEstimates } from '@/components/estimates/hooks/useEstimates';
import { StatusType } from '@/types/common';
import { formatDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

/**
 * Estimates page component for listing and managing estimates
 * Navigates to the detail page for viewing estimate details
 */
const Estimates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { estimates, loading, error, fetchEstimates } = useEstimates();

  // Refresh estimates when component mounts or is revisited
  useEffect(() => {
    fetchEstimates();
  }, []);

  const handleViewEstimate = (estimate: EstimateType) => {
    navigate(`/estimates/${estimate.id}`);
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
            error={error}
            searchQuery={searchQuery}
            onViewEstimate={handleViewEstimate}
            formatDate={formatDate}
            onRefreshEstimates={fetchEstimates}
          />
        </div>
      </div>
    </PageTransition>
  );
};

export default Estimates;
