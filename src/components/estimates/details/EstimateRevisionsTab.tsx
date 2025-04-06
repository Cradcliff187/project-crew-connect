
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { EstimateRevision } from '../types/estimateTypes';
import EstimateRevisionDialog from '../detail/dialogs/EstimateRevisionDialog';
import EstimateRevisionsList from '../detail/EstimateRevisionsList';

interface EstimateRevisionsTabProps {
  revisions: EstimateRevision[];
  estimateId: string;
  onRefresh: () => void;
  formatDate: (date: string) => string;
  clientName?: string;
  clientEmail?: string;
}

const EstimateRevisionsTab: React.FC<EstimateRevisionsTabProps> = ({
  revisions,
  estimateId,
  onRefresh,
  formatDate,
  clientName,
  clientEmail
}) => {
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  
  // Get the highest version number from revisions
  const currentVersion = Math.max(
    ...revisions.map(rev => rev.version || 0),
    0
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Estimate Revisions</h2>
          <Button 
            onClick={() => setRevisionDialogOpen(true)}
            className="bg-[#0485ea] hover:bg-[#0373ce]"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Revision
          </Button>
        </div>

        <EstimateRevisionsList
          estimateId={estimateId}
          revisions={revisions}
          onRefresh={onRefresh}
          clientName={clientName}
        />

        <EstimateRevisionDialog
          open={revisionDialogOpen}
          onOpenChange={setRevisionDialogOpen}
          estimateId={estimateId}
          currentVersion={currentVersion}
          onSuccess={onRefresh}
        />
      </CardContent>
    </Card>
  );
};

export default EstimateRevisionsTab;
