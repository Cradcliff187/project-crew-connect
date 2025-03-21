
import React from 'react';
import EstimateDetailsDialog from './details/EstimateDetailsDialog';
import { EstimateItem, EstimateRevision } from './types/estimateTypes';
import { StatusType } from '@/types/common';
import { Document } from '@/components/documents/schemas/documentSchema';

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
  documents?: Document[];
  open: boolean;
  onClose: () => void;
};

const EstimateDetails: React.FC<EstimateDetailsProps> = ({ 
  estimate, 
  items = [], 
  revisions = [], 
  documents = [],
  open, 
  onClose 
}) => {
  console.log('EstimateDetails rendering with:', {
    estimateId: estimate.id,
    itemsCount: items.length,
    revisionsCount: revisions.length,
    documentsCount: documents.length
  });
  
  return (
    <EstimateDetailsDialog
      estimate={estimate}
      items={items}
      revisions={revisions}
      documents={documents}
      open={open}
      onClose={onClose}
    />
  );
};

export default EstimateDetails;
