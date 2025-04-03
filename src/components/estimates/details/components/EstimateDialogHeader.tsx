
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PDFExportButton from '../../detail/PDFExportButton';

interface EstimateDialogHeaderProps {
  estimate: {
    id: string;
    client: string;
    project?: string;
    date: string;
    description?: string;
  };
  contentRef: React.RefObject<HTMLDivElement>;
  onCreateRevision: () => void;
}

const EstimateDialogHeader: React.FC<EstimateDialogHeaderProps> = ({
  estimate,
  contentRef,
  onCreateRevision
}) => {
  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-2">
        <DialogTitle className="text-xl font-semibold text-[#0485ea]">
          {estimate.project || `Estimate for ${estimate.client}`}
        </DialogTitle>
        <DialogDescription className="mt-1">
          {estimate.description || `View and manage estimate details`}
        </DialogDescription>
      </DialogHeader>
      
      <div className="px-6 py-2 border-b flex justify-between items-center">
        <div className="flex-1">
          {/* TabsList will be placed here by parent component */}
        </div>
        
        <div className="flex gap-2 ml-4">
          <PDFExportButton 
            estimateId={estimate.id}
            clientName={estimate.client}
            projectName={estimate.project || ''}
            date={estimate.date}
            contentRef={contentRef}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateRevision}
          >
            Create Revision
          </Button>
        </div>
      </div>
    </>
  );
};

export default EstimateDialogHeader;
