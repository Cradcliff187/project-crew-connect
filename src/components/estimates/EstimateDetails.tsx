
import React from 'react';
import EstimateDetailsDialog from './details/EstimateDetailsDialog';

export interface EstimateDetailsProps {
  estimate: {
    id: string;
    client: string;
    project?: string;
    date: string;
    status: string;
    total?: number;
    description?: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
  revisions: {
    id: string;
    version: number;
    date: string;
    notes?: string;
    status: string;
    is_current: boolean;
  }[];
  open: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

const EstimateDetails: React.FC<EstimateDetailsProps> = (props) => {
  return <EstimateDetailsDialog {...props} />;
};

export default EstimateDetails;
