
import React from 'react';
import EstimateDetailView from './detail/EstimateDetailView';

interface EstimateProps {
  data: {
    estimateid: string;
    customerid?: string;
    customername?: string;
    projectid?: string;
    projectname?: string;
    job_description?: string;
    estimateamount: number;
    contingencyamount?: number;
    contingency_percentage?: number;
    datecreated?: string;
    sentdate?: string;
    approveddate?: string;
    status: string;
    sitelocationaddress?: string;
    sitelocationcity?: string;
    sitelocationstate?: string;
    sitelocationzip?: string;
    items: {
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }[];
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (id: string, status: string) => void;
  onRefresh?: () => void;
}

const EstimateDetail: React.FC<EstimateProps> = ({ 
  data, 
  onEdit, 
  onDelete,
  onStatusChange,
  onRefresh
}) => {
  return (
    <EstimateDetailView
      data={data}
      onEdit={onEdit}
      onDelete={onDelete}
      onStatusChange={onStatusChange}
      onRefresh={onRefresh}
    />
  );
};

export default EstimateDetail;
