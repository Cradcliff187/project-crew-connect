
import React, { useState } from 'react';
import { StatusType } from '@/types/common';
import EstimateDetailHeader from './EstimateDetailHeader';
import EstimateDetailContent from './EstimateDetailContent';
import EstimateDeleteDialog from './dialogs/EstimateDeleteDialog';
import EstimateConvertDialog from './dialogs/EstimateConvertDialog';

interface EstimateDetailViewProps {
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

const EstimateDetailView: React.FC<EstimateDetailViewProps> = ({ 
  data, 
  onEdit, 
  onDelete,
  onStatusChange,
  onRefresh
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setDeleteDialogOpen(false);
  };

  const handleStatusChange = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <EstimateDetailHeader 
        data={data}
        onEdit={onEdit}
        onDelete={() => setDeleteDialogOpen(true)}
        onConvert={() => setConvertDialogOpen(true)}
        onStatusChange={handleStatusChange}
      />
      
      <EstimateDetailContent 
        data={data} 
        onRefresh={onRefresh} 
      />
      
      <EstimateDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
      />
      
      <EstimateConvertDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        estimate={{
          id: data.estimateid,
          client: data.customerid || data.customername || 'Unknown Client',
          project: data.projectname || `Project from EST-${data.estimateid.substring(0, 8)}`,
          description: data.job_description,
          location: {
            address: data.sitelocationaddress,
            city: data.sitelocationcity,
            state: data.sitelocationstate,
            zip: data.sitelocationzip
          },
          amount: data.estimateamount,
          status: data.status as StatusType
        }}
        onStatusChange={onStatusChange}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default EstimateDetailView;
