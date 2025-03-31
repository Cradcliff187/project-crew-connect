
import { useState, useEffect } from 'react';
import { EntityType } from '@/hooks/useStatusHistory';
import { StatusOption } from '@/components/common/status/UniversalStatusControl';

/**
 * Hook to get status options based on entity type and current status
 */
export function useStatusOptions(entityType: EntityType, currentStatus?: string) {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [allStatusOptions, setAllStatusOptions] = useState<StatusOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStatusOptions = async () => {
      try {
        setLoading(true);
        
        // Define all possible status options for each entity type
        const options: Record<EntityType, StatusOption[]> = {
          'PROJECT': [
            { value: 'new', label: 'New' },
            { value: 'active', label: 'Active' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
            { value: 'pending', label: 'Pending' }
          ],
          'WORK_ORDER': [
            { value: 'NEW', label: 'New' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'ON_HOLD', label: 'On Hold' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' }
          ],
          'CHANGE_ORDER': [
            { value: 'DRAFT', label: 'Draft' },
            { value: 'SUBMITTED', label: 'Submitted' },
            { value: 'REVIEW', label: 'In Review' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
            { value: 'IMPLEMENTED', label: 'Implemented' },
            { value: 'CANCELLED', label: 'Cancelled' }
          ],
          'CONTACT': [
            { value: 'PROSPECT', label: 'Prospect' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' }
          ],
          'VENDOR': [
            { value: 'POTENTIAL', label: 'Potential' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' }
          ],
          'ESTIMATE': [
            { value: 'draft', label: 'Draft' },
            { value: 'sent', label: 'Sent' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'converted', label: 'Converted' }
          ]
        };
        
        // Store all options for this entity type
        setAllStatusOptions(options[entityType] || []);
        
        // If current status is provided, filter options based on allowed transitions
        if (currentStatus) {
          const filteredOptions = filterOptionsByAllowedTransitions(
            entityType, 
            currentStatus, 
            options[entityType] || []
          );
          setStatusOptions(filteredOptions);
        } else {
          setStatusOptions(options[entityType] || []);
        }
      } catch (error) {
        console.error('Error getting status options:', error);
        setStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatusOptions();
  }, [entityType, currentStatus]);
  
  return { statusOptions, allStatusOptions, loading };
}

/**
 * Filter status options based on allowed transitions for the entity type and current status
 */
function filterOptionsByAllowedTransitions(
  entityType: EntityType,
  currentStatus: string,
  allOptions: StatusOption[]
): StatusOption[] {
  // Define allowed transitions for each entity type and status
  const allowedTransitions: Record<EntityType, Record<string, string[]>> = {
    'PROJECT': {
      'new': ['active', 'on_hold', 'cancelled', 'pending'],
      'active': ['completed', 'on_hold', 'cancelled'],
      'on_hold': ['active', 'cancelled'],
      'completed': ['active'],
      'cancelled': ['active'],
      'pending': ['active', 'cancelled', 'on_hold']
    },
    'WORK_ORDER': {
      'NEW': ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
      'ON_HOLD': ['IN_PROGRESS', 'CANCELLED'],
      'COMPLETED': ['IN_PROGRESS'],
      'CANCELLED': ['NEW', 'IN_PROGRESS']
    },
    'CHANGE_ORDER': {
      'DRAFT': ['SUBMITTED', 'CANCELLED'],
      'SUBMITTED': ['REVIEW', 'CANCELLED'],
      'REVIEW': ['APPROVED', 'REJECTED', 'CANCELLED'],
      'APPROVED': ['IMPLEMENTED', 'CANCELLED'],
      'REJECTED': ['DRAFT', 'CANCELLED'],
      'IMPLEMENTED': ['CANCELLED'],
      'CANCELLED': ['DRAFT']
    },
    'CONTACT': {
      'PROSPECT': ['ACTIVE', 'INACTIVE'],
      'ACTIVE': ['INACTIVE'],
      'INACTIVE': ['ACTIVE']
    },
    'VENDOR': {
      'POTENTIAL': ['APPROVED', 'ACTIVE', 'INACTIVE'],
      'APPROVED': ['ACTIVE', 'INACTIVE'],
      'ACTIVE': ['INACTIVE'],
      'INACTIVE': ['ACTIVE']
    },
    'ESTIMATE': {
      'draft': ['sent'],
      'sent': ['approved', 'rejected', 'pending'],
      'pending': ['approved', 'rejected'],
      'approved': ['converted'],
      'rejected': ['draft'],
      'converted': []
    }
  };
  
  // Normalize the current status for case-insensitive comparison
  const normalizedCurrentStatus = currentStatus.toUpperCase();
  
  // Get allowed transitions for this entity and status
  const transitions = Object.entries(allowedTransitions[entityType]).find(
    ([status]) => status.toUpperCase() === normalizedCurrentStatus
  );
  
  if (!transitions) {
    console.warn(`No transitions defined for ${entityType} with status ${normalizedCurrentStatus}`);
    return allOptions;
  }
  
  // Filter options to only include allowed transitions
  return allOptions.filter(option => 
    transitions[1].map(s => s.toUpperCase()).includes(option.value.toUpperCase())
  );
}
