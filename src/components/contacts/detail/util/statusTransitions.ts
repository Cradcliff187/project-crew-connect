
interface StatusOption {
  value: string;
  label: string;
}

export const getStatusOptions = (type: string, currentStatus: string): StatusOption[] => {
  if (!currentStatus) return [];

  if (type === 'client' || type === 'customer') {
    switch (currentStatus) {
      case 'PROSPECT':
        return [{ value: 'ACTIVE', label: 'Convert to Active' }];
      case 'ACTIVE':
        return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
      case 'INACTIVE':
        return [{ value: 'ACTIVE', label: 'Reactivate' }];
      default:
        return [];
    }
  } else if (type === 'supplier') {
    switch (currentStatus) {
      case 'POTENTIAL':
        return [{ value: 'APPROVED', label: 'Approve Vendor' }];
      case 'APPROVED':
        return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
      case 'INACTIVE':
        return [{ value: 'APPROVED', label: 'Reactivate' }];
      default:
        return [];
    }
  } else if (type === 'subcontractor') {
    switch (currentStatus) {
      case 'PENDING':
        return [{ value: 'QUALIFIED', label: 'Mark as Qualified' }];
      case 'QUALIFIED':
        return [{ value: 'ACTIVE', label: 'Convert to Active' }];
      case 'ACTIVE':
        return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
      case 'INACTIVE':
        return [{ value: 'ACTIVE', label: 'Reactivate' }];
      default:
        return [];
    }
  } else if (type === 'employee') {
    switch (currentStatus) {
      case 'ACTIVE':
        return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
      case 'INACTIVE':
        return [{ value: 'ACTIVE', label: 'Reactivate' }];
      default:
        return [];
    }
  }
  
  return [];
};
