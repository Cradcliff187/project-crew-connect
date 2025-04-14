import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import EstimateActions from '../EstimateActions';
import { StatusType } from '@/types/common';
import EstimateStatusControl from './EstimateStatusControl';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import EstimateRevisionDialog from './dialogs/EstimateRevisionDialog';

interface EstimateDetailHeaderProps {
  data: {
    estimateid: string;
    customername?: string;
    datecreated?: string;
    status: string;
  };
  currentVersion?: number;
  onEdit?: () => void;
  onDelete: () => void;
  onConvert: () => void;
  onStatusChange: () => void;
}

const EstimateDetailHeader: React.FC<EstimateDetailHeaderProps> = ({
  data,
  currentVersion = 1,
  onEdit,
  onDelete,
  onConvert,
  onStatusChange,
}) => {
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const canCreateRevision = ['draft', 'sent', 'pending', 'approved', 'rejected'].includes(
    data.status
  );

  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Estimate #{data.estimateid.substring(4, 10)}</h1>
          <EstimateStatusControl
            estimateId={data.estimateid}
            currentStatus={data.status}
            onStatusChange={onStatusChange}
          />
        </div>
        <p className="text-gray-500 mt-1">Created on {formatDate(data.datecreated)}</p>
      </div>

      <div className="flex items-center gap-2">
        {canCreateRevision && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRevisionDialogOpen(true)}
            className="flex items-center"
          >
            <FileUp className="h-4 w-4 mr-1" />
            Create Revision
          </Button>
        )}

        <EstimateActions
          status={data.status as StatusType}
          onEdit={onEdit}
          onDelete={onDelete}
          onConvert={onConvert}
        />
      </div>

      <EstimateRevisionDialog
        open={revisionDialogOpen}
        onOpenChange={setRevisionDialogOpen}
        estimateId={data.estimateid}
        currentVersion={currentVersion}
        onSuccess={onStatusChange}
      />
    </div>
  );
};

export default EstimateDetailHeader;
