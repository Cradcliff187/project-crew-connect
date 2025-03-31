
import React from 'react';
import { Badge } from '@/components/ui/badge';
import EstimateActions from '../EstimateActions';
import { StatusType } from '@/types/common';
import EstimateStatusControl from './EstimateStatusControl';

interface EstimateDetailHeaderProps {
  data: {
    estimateid: string;
    customername?: string;
    datecreated?: string;
    status: string;
  };
  onEdit?: () => void;
  onDelete: () => void;
  onConvert: () => void;
  onStatusChange: () => void;
}

const EstimateDetailHeader: React.FC<EstimateDetailHeaderProps> = ({ 
  data, 
  onEdit, 
  onDelete,
  onConvert,
  onStatusChange
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
        <p className="text-gray-500 mt-1">
          Created on {formatDate(data.datecreated)}
        </p>
      </div>
      
      <EstimateActions 
        status={data.status as StatusType}
        onEdit={onEdit}
        onDelete={onDelete}
        onConvert={onConvert}
      />
    </div>
  );
};

export default EstimateDetailHeader;
