
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '../types/vendorTypes';

// Function to update vendor status with proper transitions
export const updateVendorStatus = async (
  vendorId: string, 
  newStatus: string
): Promise<boolean> => {
  try {
    // First get the current vendor details including current status
    const { data: vendor, error: fetchError } = await supabase
      .from('vendors')
      .select('*')
      .eq('vendorid', vendorId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const currentStatus = vendor.status || 'POTENTIAL';
    
    // Validate that this is an allowed transition
    if (!isValidStatusTransition(currentStatus, newStatus)) {
      toast({
        title: "Invalid Status Transition",
        description: `Cannot transition from ${currentStatus} to ${newStatus}`,
        variant: "destructive"
      });
      return false;
    }
    
    // Update the vendor status
    const { error } = await supabase
      .from('vendors')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('vendorid', vendorId);

    if (error) throw error;
    
    // Log the status change to activity log
    await logStatusChange(vendorId, newStatus, currentStatus);
    
    return true;
  } catch (error: any) {
    console.error("Error updating vendor status:", error);
    toast({
      title: "Status Update Failed",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

// Validate that a status transition is allowed
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const transitions: Record<string, string[]> = {
    // Initial to approved or active
    'POTENTIAL': ['APPROVED', 'ACTIVE'],
    // Approved to active or inactive
    'APPROVED': ['ACTIVE', 'INACTIVE'],
    // Active to inactive
    'ACTIVE': ['INACTIVE'],
    // Inactive back to active
    'INACTIVE': ['ACTIVE']
  };
  
  // If currentStatus is not defined or not in our transitions map, 
  // allow any transition to get things into a valid state
  if (!currentStatus || !transitions[currentStatus]) {
    return true;
  }
  
  return transitions[currentStatus].includes(newStatus);
}

// Log status changes to activity log
const logStatusChange = async (
  vendorId: string,
  newStatus: string,
  previousStatus: string
) => {
  try {
    await supabase
      .from('activitylog')
      .insert({
        action: 'Status Change',
        moduletype: 'VENDOR',
        referenceid: vendorId,
        status: newStatus,
        previousstatus: previousStatus,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Error logging status change:", error);
  }
};

// Get default status for a vendor
export const getDefaultVendorStatus = (): string => {
  return 'POTENTIAL';
};

// Get status display name
export const getVendorStatusDisplay = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'POTENTIAL':
      return 'Potential';
    case 'APPROVED':
      return 'Approved';
    case 'ACTIVE':
      return 'Active';
    case 'INACTIVE':
      return 'Inactive';
    default:
      return status || 'Unknown';
  }
};

// Function to get status color for CSS
export const getVendorStatusColor = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'POTENTIAL':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
