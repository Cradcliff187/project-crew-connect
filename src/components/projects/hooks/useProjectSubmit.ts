
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectFormValues } from '../schemas/projectFormSchema';

export const useProjectSubmit = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    
    try {
      let customerId = data.customerId;
      
      // If we need to create a new customer first
      if (!customerId && data.newCustomer.customerName) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            customername: data.newCustomer.customerName,
            address: data.newCustomer.address,
            city: data.newCustomer.city,
            state: data.newCustomer.state,
            zip: data.newCustomer.zip,
            contactemail: data.newCustomer.email,
            phone: data.newCustomer.phone,
            status: 'active',
            createdon: new Date().toISOString(),
          })
          .select();
        
        if (customerError) {
          throw customerError;
        }
        
        customerId = newCustomer?.[0]?.customerid;
        
        if (!customerId) {
          throw new Error('Failed to create customer - no customer ID returned');
        }
      }

      // Now we can create the project
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          projectname: data.projectName,
          customerid: customerId || null,
          jobdescription: data.jobDescription || '',
          status: data.status,
          sitelocationaddress: data.siteLocationSameAsCustomer ? null : data.siteLocation.address,
          sitelocationcity: data.siteLocationSameAsCustomer ? null : data.siteLocation.city,
          sitelocationstate: data.siteLocationSameAsCustomer ? null : data.siteLocation.state,
          sitelocationzip: data.siteLocationSameAsCustomer ? null : data.siteLocation.zip,
          createdon: new Date().toISOString(),
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      // If this project came from an estimate, update the estimate with the project ID
      if (data.estimateId) {
        const { error: updateError } = await supabase
          .from('estimates')
          .update({ 
            projectid: project?.[0]?.projectid,
            status: 'approved'
          })
          .eq('estimateid', data.estimateId);
        
        if (updateError) {
          console.error('Warning: Failed to update estimate with project ID', updateError);
          // We don't throw here as the project was created successfully
        }
      }
      
      toast({
        title: 'Project created successfully',
        description: `${data.projectName} has been added to your projects.`,
      });
      
      // Call the success callback
      onSuccess();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error creating project',
        description: error.message || 'There was an error creating the project. Please try again.',
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
