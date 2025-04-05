
import React from 'react';
import { useParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';

const EstimateDetailPage = () => {
  const { estimateId } = useParams();
  
  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Estimate Details</h1>
        <p>Estimate ID: {estimateId}</p>
      </div>
    </PageTransition>
  );
};

export default EstimateDetailPage;
