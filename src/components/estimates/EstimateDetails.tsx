
import React from 'react';
import { EstimateType } from './EstimatesTable';
import { StatusType } from '@/types/common';
import EstimateDetailsDialog from './details/EstimateDetailsDialog';
import { EstimateItem, EstimateRevision } from './types/estimateTypes';

export interface EstimateDetailsProps {
  estimate: {
    id: string;
    customerId: string;
    client: string;
    project?: string;
    date: string;
    status: StatusType;
    total?: number;
    description?: string;
    amount?: number;
    versions?: number;
  };
  items: EstimateItem[];
  revisions: EstimateRevision[];
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

/**
 * EstimateDetails component serves as a wrapper for EstimateDetailsDialog
 * It's used primarily on the Estimates listing page to show details in a dialog
 */
const EstimateDetails: React.FC<EstimateDetailsProps> = (props) => {
  return <EstimateDetailsDialog {...props} />;
};

export default EstimateDetails;
