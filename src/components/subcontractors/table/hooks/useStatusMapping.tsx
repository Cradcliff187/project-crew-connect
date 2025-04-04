
import { StatusType } from '@/types/common';

export const useStatusMapping = () => {
  const getStatusType = (status: string | null): StatusType => {
    if (!status) return 'neutral';
    
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'neutral';
      case 'APPROVED':
        return 'info';
      case 'POTENTIAL':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return { getStatusType };
};

export default useStatusMapping;
