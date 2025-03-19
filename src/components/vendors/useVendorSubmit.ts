
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VendorFormData } from './VendorForm';

export const useVendorSubmit = (onSuccess: () => void, isEditing = false) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data: VendorFormData) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        // Ensure vendorid is available for updating
        if (!data.vendorid) {
          throw new Error('Vendor ID is missing. Cannot update vendor.');
        }
        
        console.log('Updating vendor with ID:', data.vendorid);
        console.log('Update data:', data);
        
        // Update existing vendor
        const { error } = await supabase
          .from('vendors')
          .update({
            vendorname: data.vendorname,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            status: data.status,
            // Financial info
            payment_terms: data.payment_terms,
            hourly_rate: data.hourly_rate,
            tax_id: data.tax_id,
            // Notes
            notes: data.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('vendorid', data.vendorid);
        
        if (error) {
          console.error('Error updating vendor:', error);
          throw error;
        }
        
        console.log('Vendor updated successfully');
        
        toast({
          title: 'Vendor updated successfully',
          description: `${data.vendorname} has been updated.`,
        });
      } else {
        // Generate a unique ID for the vendor
        const { data: vendorIdData, error: vendorIdError } = await supabase
          .rpc('generate_vendor_id');
        
        if (vendorIdError) {
          throw vendorIdError;
        }
        
        const vendorId = vendorIdData;
        
        // Now insert the vendor with the pre-generated ID
        const { data: vendor, error } = await supabase
          .from('vendors')
          .insert({
            vendorid: vendorId,
            vendorname: data.vendorname,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            status: data.status,
            // Financial info
            payment_terms: data.payment_terms,
            hourly_rate: data.hourly_rate,
            tax_id: data.tax_id,
            // Notes
            notes: data.notes,
            createdon: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();
        
        if (error) {
          throw error;
        }
        
        toast({
          title: 'Vendor created successfully',
          description: `${data.vendorname} has been added to your vendors.`,
        });
      }
      
      // Call the success callback
      onSuccess();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} vendor:`, error);
      toast({
        title: `Error ${isEditing ? 'updating' : 'creating'} vendor`,
        description: error.message || `There was an error ${isEditing ? 'updating' : 'creating'} the vendor. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    handleSubmit,
  };
};
