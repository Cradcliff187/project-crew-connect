import React from 'react';
import { Document } from '@/components/documents/schemas/documentSchema';
import EstimateDocumentsSection from '@/components/estimates/documents/EstimateDocumentsSection';

interface EstimateDocumentsTabProps {
  estimateId: string;
  onShareDocument?: (document: Document) => void;
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({
  estimateId,
  onShareDocument,
}) => {
  return (
    <EstimateDocumentsSection
      estimateId={estimateId}
      estimateName={`Estimate #${estimateId.substring(4, 10)}`}
    />
  );
};

export default EstimateDocumentsTab;
