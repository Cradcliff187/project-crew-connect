
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '../types/vendorTypes';
import { 
  validateStatusTransition, 
  getStatusDisplayName,
  getStatusColorClass
} from '@/utils/statusTransitions';

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
    if (!validateStatusTransition('VENDOR', currentStatus, newStatus)) {
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
  return getStatusDisplayName('VENDOR', status);
};

// Function to get status color for CSS
export const getVendorStatusColor = (status: string): string => {
  return getStatusColorClass('VENDOR', status);
};
