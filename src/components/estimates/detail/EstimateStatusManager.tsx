
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import UniversalStatusControl, { StatusOption } from '@/components/common/status/UniversalStatusControl';
import { StatusBadge } from '@/components/common/status/StatusBadge';
import { useStatusOptions } from '@/hooks/useStatusOptions';

interface EstimateStatusManagerProps {
  estimateId: string;
  currentStatus: string;
  onStatusChange: () => void;
  showDevMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const EstimateStatusManager: React.FC<EstimateStatusManagerProps> = ({
  estimateId,
  currentStatus,
  onStatusChange,
  showDevMode = false,
  size = 'md',
  className = ''
}) => {
  const { toast } = useToast();
  const { statusOptions } = useStatusOptions('ESTIMATE', currentStatus);
  
  // Status options for estimates
  const standardStatusOptions: StatusOption[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'converted', label: 'Converted' }
  ];

  // For dev mode, show all possible statuses
  const allStatusOptions = showDevMode 
    ? standardStatusOptions
    : getAvailableStatusOptions(currentStatus);

  // Get allowed status transitions based on current status
  function getAvailableStatusOptions(status: string): StatusOption[] {
    const lowerStatus = status.toLowerCase();
    
    switch (lowerStatus) {
      case 'draft':
        return standardStatusOptions.filter(opt => 
          ['sent'].includes(opt.value.toLowerCase())
        );
      case 'sent':
      case 'pending':
        return standardStatusOptions.filter(opt => 
          ['approved', 'rejected'].includes(opt.value.toLowerCase())
        );
      case 'approved':
        return standardStatusOptions.filter(opt => 
          ['converted'].includes(opt.value.toLowerCase())
        );
      case 'rejected':
        return standardStatusOptions.filter(opt => 
          ['draft'].includes(opt.value.toLowerCase())
        );
      default:
        return [];
    }
  }

  // Get additional fields to update based on status
  const getAdditionalFields = (newStatus: string): Record<string, any> => {
    const fields: Record<string, any> = {};
    
    if (newStatus === 'approved') {
      fields.approveddate = new Date().toISOString();
    } else if (newStatus === 'sent') {
      fields.sentdate = new Date().toISOString();
    }
    
    return fields;
  };

  return (
    <div className={`flex items-center ${className}`}>
      <UniversalStatusControl
        entityId={estimateId}
        entityType="ESTIMATE"
        currentStatus={currentStatus}
        statusOptions={allStatusOptions}
        tableName="estimates"
        idField="estimateid"
        onStatusChange={onStatusChange}
        additionalUpdateFields={(newStatus) => getAdditionalFields(newStatus)}
        size={size}
        showStatusBadge={true}
        recordHistory={true}
        className={className}
      />
    </div>
  );
};

export default EstimateStatusManager;
