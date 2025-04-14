import { useMemo } from 'react';
import { EntityType } from './useStatusHistory';

interface StatusOption {
  value: string;
  label: string;
}

// Get status options for different entity types
export function useStatusOptions(entityType: EntityType, currentStatus: string) {
  const statusOptions = useMemo(() => {
    switch (entityType) {
      case 'PROJECT':
        return getProjectStatusOptions(currentStatus);
      case 'WORK_ORDER':
        return getWorkOrderStatusOptions(currentStatus);
      case 'CHANGE_ORDER':
        return getChangeOrderStatusOptions(currentStatus);
      case 'CONTACT':
        return getContactStatusOptions(currentStatus);
      case 'VENDOR':
        return getVendorStatusOptions(currentStatus);
      case 'ESTIMATE':
        return getEstimateStatusOptions(currentStatus);
      default:
        return [];
    }
  }, [entityType, currentStatus]);

  return { statusOptions };
}

// Get status options for projects
function getProjectStatusOptions(currentStatus: string): StatusOption[] {
  const statusOptions: StatusOption[] = [
    { value: 'new', label: 'New' },
    { value: 'active', label: 'Active' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'pending', label: 'Pending' },
  ];

  return statusOptions.filter(option => option.value !== currentStatus.toLowerCase());
}

// Get status options for work orders
function getWorkOrderStatusOptions(currentStatus: string): StatusOption[] {
  const allOptions: StatusOption[] = [
    { value: 'NEW', label: 'New' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  // Get valid transitions based on current status
  const transitionMap: Record<string, string[]> = {
    NEW: ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
    ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
    COMPLETED: ['IN_PROGRESS'],
    CANCELLED: ['NEW', 'IN_PROGRESS'],
  };

  // Get valid transitions or return all options if current status isn't in our map
  const validTransitions = transitionMap[currentStatus] || allOptions.map(o => o.value);

  return allOptions.filter(
    option => validTransitions.includes(option.value) && option.value !== currentStatus
  );
}

// Get status options for change orders
function getChangeOrderStatusOptions(currentStatus: string): StatusOption[] {
  const allOptions: StatusOption[] = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'REVIEW', label: 'Under Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'IMPLEMENTED', label: 'Implemented' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  // Get valid transitions based on current status
  const transitionMap: Record<string, string[]> = {
    DRAFT: ['SUBMITTED', 'CANCELLED'],
    SUBMITTED: ['REVIEW', 'CANCELLED'],
    REVIEW: ['APPROVED', 'REJECTED', 'CANCELLED'],
    APPROVED: ['IMPLEMENTED', 'CANCELLED'],
    REJECTED: ['DRAFT', 'CANCELLED'],
    IMPLEMENTED: ['CANCELLED'],
    CANCELLED: ['DRAFT'],
  };

  // Get valid transitions or return all options if current status isn't in our map
  const validTransitions = transitionMap[currentStatus] || allOptions.map(o => o.value);

  return allOptions.filter(
    option => validTransitions.includes(option.value) && option.value !== currentStatus
  );
}

// Get status options for contacts
function getContactStatusOptions(currentStatus: string): StatusOption[] {
  const allOptions: StatusOption[] = [
    { value: 'PROSPECT', label: 'Prospect' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  // Get valid transitions based on current status
  const transitionMap: Record<string, string[]> = {
    PROSPECT: ['ACTIVE', 'INACTIVE'],
    ACTIVE: ['INACTIVE'],
    INACTIVE: ['ACTIVE'],
  };

  // Get valid transitions or return all options if current status isn't in our map
  const validTransitions = transitionMap[currentStatus] || allOptions.map(o => o.value);

  return allOptions.filter(
    option => validTransitions.includes(option.value) && option.value !== currentStatus
  );
}

// Get status options for vendors
function getVendorStatusOptions(currentStatus: string): StatusOption[] {
  const allOptions: StatusOption[] = [
    { value: 'POTENTIAL', label: 'Potential' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  // Get valid transitions based on current status
  const transitionMap: Record<string, string[]> = {
    POTENTIAL: ['APPROVED', 'ACTIVE', 'INACTIVE'],
    APPROVED: ['ACTIVE', 'INACTIVE'],
    ACTIVE: ['INACTIVE'],
    INACTIVE: ['ACTIVE'],
  };

  // Get valid transitions or return all options if current status isn't in our map
  const validTransitions = transitionMap[currentStatus] || allOptions.map(o => o.value);

  return allOptions.filter(
    option => validTransitions.includes(option.value) && option.value !== currentStatus
  );
}

// Get status options for estimates
function getEstimateStatusOptions(currentStatus: string): StatusOption[] {
  const allOptions: StatusOption[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'converted', label: 'Converted to Project' },
  ];

  // Get valid transitions based on current status
  const transitionMap: Record<string, string[]> = {
    draft: ['sent'],
    sent: ['approved', 'rejected'],
    pending: ['approved', 'rejected'],
    approved: ['converted'],
    rejected: ['draft'],
    converted: [],
  };

  // Get valid transitions or return all options if current status isn't in our map
  const validTransitions =
    transitionMap[currentStatus.toLowerCase()] || allOptions.map(o => o.value);

  return allOptions.filter(
    option =>
      validTransitions.includes(option.value) &&
      option.value.toLowerCase() !== currentStatus.toLowerCase()
  );
}
