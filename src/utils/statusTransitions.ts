
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EntityType } from '@/hooks/useStatusHistory';

/**
 * Generic status transition validator and handler
 * This can be used by any entity type to validate and perform status transitions
 */
export const validateStatusTransition = (
  entityType: EntityType,
  currentStatus: string,
  newStatus: string
): boolean => {
  // Define allowed transitions for each entity type
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
    }
  };

  // Normalize status values for case-insensitive comparison
  const normalizedCurrentStatus = currentStatus.toUpperCase();
  const normalizedNewStatus = newStatus.toUpperCase();
  
  // If current status doesn't exist in our mapping, allow any transition
  if (!allowedTransitions[entityType][normalizedCurrentStatus]) {
    console.warn(`No transition rules defined for ${entityType} with status ${normalizedCurrentStatus}`);
    return true;
  }
  
  // Check if the transition is allowed
  return allowedTransitions[entityType][normalizedCurrentStatus]
    .map(s => s.toUpperCase())
    .includes(normalizedNewStatus);
};

/**
 * Updates an entity's status with proper transition validation
 */
export const updateEntityStatus = async (
  entityType: EntityType,
  entityId: string,
  currentStatus: string,
  newStatus: string,
  tableName: string,
  idField: string = 'id',
  statusField: string = 'status',
  additionalFields: Record<string, any> = {}
): Promise<boolean> => {
  try {
    // Validate the transition
    if (!validateStatusTransition(entityType, currentStatus, newStatus)) {
      toast({
        title: "Invalid Status Transition",
        description: `Cannot transition ${entityType.toLowerCase()} from ${currentStatus} to ${newStatus}`,
        variant: "destructive"
      });
      return false;
    }
    
    // Update the entity status
    const updateData = {
      [statusField]: newStatus,
      updated_at: new Date().toISOString(),
      ...additionalFields
    };
    
    const { error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq(idField, entityId);

    if (error) throw error;
    
    // Toast success message
    toast({
      title: "Status Updated",
      description: `Status changed to ${newStatus.toLowerCase()}.`,
      className: 'bg-[#0485ea]',
    });
    
    return true;
  } catch (error: any) {
    console.error(`Error updating ${entityType} status:`, error);
    toast({
      title: "Status Update Failed",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Get formatted display name for a status value
 */
export const getStatusDisplayName = (
  entityType: EntityType, 
  statusValue: string
): string => {
  // Format the status value by converting underscores to spaces and capitalizing first letter of each word
  if (!statusValue) return 'Unknown';
  
  return statusValue
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get CSS class for status color based on entity type and status value
 */
export const getStatusColorClass = (
  entityType: EntityType,
  statusValue: string
): string => {
  const status = statusValue?.toLowerCase() || '';
  
  if (status.includes('active') || status.includes('progress')) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  } else if (status.includes('approved')) {
    return 'bg-green-100 text-green-800 border-green-200';
  } else if (status.includes('completed')) {
    return 'bg-green-100 text-green-800 border-green-200';
  } else if (status.includes('hold') || status.includes('pending')) {
    return 'bg-amber-100 text-amber-800 border-amber-200';
  } else if (status.includes('cancel') || status.includes('reject')) {
    return 'bg-red-100 text-red-800 border-red-200';
  } else if (status.includes('new') || status.includes('draft')) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  } else if (status.includes('potential') || status.includes('prospect')) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  } else if (status.includes('inactive')) {
    return 'bg-gray-100 text-gray-800 border-gray-200';
  } else {
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Get default status for a new entity of given type
 */
export const getDefaultStatusForEntityType = (entityType: EntityType): string => {
  switch (entityType) {
    case 'PROJECT':
      return 'new';
    case 'WORK_ORDER':
      return 'NEW';
    case 'CHANGE_ORDER':
      return 'DRAFT';
    case 'CONTACT':
      return 'PROSPECT';
    case 'VENDOR':
      return 'POTENTIAL';
    default:
      return '';
  }
};
