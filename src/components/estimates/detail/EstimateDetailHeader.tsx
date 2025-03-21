
import React from 'react';
import { Badge } from '@/components/ui/badge';
import EstimateActions from '../EstimateActions';
import { StatusType } from '@/types/common';

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
}

const EstimateDetailHeader: React.FC<EstimateDetailHeaderProps> = ({ 
  data, 
  onEdit, 
  onDelete,
  onConvert 
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <Badge className={getStatusBadgeClass(data.status)}>
            {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </Badge>
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
