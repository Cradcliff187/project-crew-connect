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
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold font-montserrat">Documents</h3>
        <p className="text-sm text-muted-foreground font-opensans">
          Manage documents related to this estimate
        </p>
      </div>

      <EstimateDocumentsSection
        estimateId={estimateId}
        estimateName={estimateName || `Estimate #${estimateId.substring(0, 6)}`}
        revisionId={currentRevisionId}
        versionNumber={currentVersion}
      />
    </div>
  );
};

export default EstimateDocumentsTab;
