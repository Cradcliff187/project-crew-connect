
import React from 'react';
import EstimateDetailsDialog from './details/EstimateDetailsDialog';
import { EstimateItem, EstimateRevision } from './types/estimateTypes';
import { StatusType } from '@/types/common';

export type EstimateDetailsProps = {
  estimate: {
    id: string;
    client: string;
    project: string;
    date: string;
    amount: number;
    status: StatusType | string;
    versions: number;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    description?: string;
  };
  items?: EstimateItem[];
  revisions?: EstimateRevision[];
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
};

const EstimateDetails: React.FC<EstimateDetailsProps> = ({ 
  estimate, 
  items = [], 
  revisions = [], 
  open, 
  onClose,
  onStatusChange
}) => {
  return (
    <EstimateDetailsDialog
      estimate={estimate}
      items={items}
      revisions={revisions}
      open={open}
      onClose={onClose}
      onStatusChange={onStatusChange}
    />
  );
};

export default EstimateDetails;
