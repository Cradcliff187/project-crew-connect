import React from 'react';
import { Document } from '@/components/documents/schemas/documentSchema';
import EstimateDocumentsSection from '@/components/estimates/documents/EstimateDocumentsSection';

interface EstimateDocumentsTabProps {
  estimateId: string;
  estimateName?: string;
  currentRevisionId?: string;
  currentVersion?: number;
  onShareDocument?: (document: Document) => void;
}

const EstimateDocumentsTab: React.FC<EstimateDocumentsTabProps> = ({
  estimateId,
  estimateName,
  currentRevisionId,
  currentVersion,
  onShareDocument,
}) => {
  return (
    <EstimateDocumentsSection
      estimateId={estimateId}
      estimateName={estimateName || `Estimate #${estimateId.substring(0, 6)}`}
      revisionId={currentRevisionId}
      versionNumber={currentVersion}
    />
  );
};

export default EstimateDocumentsTab;
