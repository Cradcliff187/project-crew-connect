
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VendorFormData } from './VendorForm';

export const useVendorSubmit = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data: VendorFormData) => {
    setIsSubmitting(true);
    
    try {
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
          createdon: new Date().toISOString(),
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Vendor created successfully',
        description: `${data.vendorname} has been added to your vendors.`,
      });
      
      // Call the success callback
      onSuccess();
    } catch (error: any) {
      console.error('Error creating vendor:', error);
      toast({
        title: 'Error creating vendor',
        description: error.message || 'There was an error creating the vendor. Please try again.',
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
