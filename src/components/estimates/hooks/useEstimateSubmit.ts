
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

export const useEstimateSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createNewCustomer = async (newCustomerData: any) => {
    try {
      // Generate a new customer ID
      const customerId = `CUS-${Date.now().toString().slice(-6)}`;
      
      // Insert the new customer
      const { data, error } = await supabase
        .from('customers')
        .insert({
          customerid: customerId,
          customername: newCustomerData.name,
          contactemail: newCustomerData.email,
          phone: newCustomerData.phone,
          address: newCustomerData.address,
          city: newCustomerData.city,
          state: newCustomerData.state,
          zip: newCustomerData.zip,
          createdon: new Date().toISOString(),
          status: 'ACTIVE'
        })
        .select('customerid')
        .single();

      if (error) throw error;
      return data.customerid;
    } catch (error) {
      console.error('Error creating new customer:', error);
      throw error;
    }
  };

  const createEstimateDocument = async (estimateId: string, estimateData: EstimateFormValues, customerName: string) => {
    try {
      const documentId = uuidv4();
      
      // Format the document name
      const documentName = `Estimate-${estimateId}-${new Date().toLocaleDateString().replace(/\//g, '-')}`;
      
      // Create the document content (simplified for this example)
      const documentContent = JSON.stringify(estimateData);
      
      // Insert the document record
      await supabase
        .from('documents')
        .insert({
          document_id: documentId,
          entity_id: estimateId,
          entity_type: 'estimate',
          file_name: documentName,
          storage_path: `estimates/${estimateId}/${documentId}.json`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: ['estimate'],
          category: 'estimate',
          mime_type: 'application/json'
        });
      
      return documentId;
    } catch (error) {
      console.error('Error creating estimate document:', error);
      // We'll continue even if document creation fails
      return null;
    }
  };

  const submitEstimate = async (
    formData: EstimateFormValues, 
    customers: { id: string; name: string }[],
    onSuccess: () => void
  ) => {
    setIsSubmitting(true);
    try {
      // Handle potential new customer creation
      let customerId = formData.customer;
      let customerName = '';
      
      if (formData.isNewCustomer && formData.newCustomer?.name) {
        // Create a new customer first
        customerId = await createNewCustomer(formData.newCustomer);
        customerName = formData.newCustomer.name;
      } else {
        // Get the customer name from the selected customer
        const selectedCustomer = customers.find(c => c.id === formData.customer);
        customerName = selectedCustomer?.name || '';
      }

      // Calculate total amount
      const totalAmount = formData.items.reduce((total, item) => {
        const cost = parseFloat(item.cost) || 0;
        const markup = parseFloat(item.markup_percentage) || 0;
        const price = cost * (1 + markup / 100);
        const quantity = parseFloat(item.quantity || '1') || 1;
        return total + (price * quantity);
      }, 0);
      
      // Calculate contingency amount
      const contingencyPercentage = parseFloat(formData.contingency_percentage) || 0;
      const contingencyAmount = totalAmount * (contingencyPercentage / 100);
      
      // Insert estimate - set estimateid to null to let the database generate it
      const { data: newEstimate, error } = await supabase
        .from('estimates')
        .insert({
          // estimateid is omitted to let the database generate it
          projectname: formData.project,
          'job description': formData.description,
          customerid: customerId,
          customername: customerName,
          estimateamount: totalAmount + contingencyAmount,
          contingencyamount: contingencyAmount,
          contingency_percentage: contingencyPercentage,
          datecreated: new Date().toISOString(),
          status: 'draft',
          sitelocationaddress: formData.location.address,
          sitelocationcity: formData.location.city,
          sitelocationstate: formData.location.state,
          sitelocationzip: formData.location.zip,
        })
        .select('estimateid')
        .single();

      if (error) throw error;
      
      // Get the database-generated estimate ID
      const estimateId = newEstimate.estimateid;
      
      // Create a document record for the estimate
      await createEstimateDocument(estimateId, formData, customerName);
      
      toast({ 
        title: "Estimate created successfully",
        description: `Estimate ${estimateId} has been created` 
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting estimate:', error);
      toast({ 
        title: "Error creating estimate",
        description: "There was a problem creating the estimate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitEstimate };
};
