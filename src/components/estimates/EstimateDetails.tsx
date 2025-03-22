
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
  itemDocuments?: Record<string, Document[]>;
  open: boolean;
  onClose: () => void;
  onDocumentsUpdated?: () => void;
};

const EstimateDetails: React.FC<EstimateDetailsProps> = ({ 
  estimate, 
  items = [], 
  revisions = [], 
  itemDocuments = {},
  open, 
  onClose,
  onDocumentsUpdated
}) => {
  return (
    <EstimateDetailsDialog
      estimate={estimate}
      items={items}
      revisions={revisions}
      itemDocuments={itemDocuments}
      open={open}
      onClose={onClose}
      onDocumentsUpdated={onDocumentsUpdated}
    />
  );
};

export default EstimateDetails;
