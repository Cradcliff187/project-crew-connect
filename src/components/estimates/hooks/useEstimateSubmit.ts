import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

export const useEstimateSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEstimate = async (
    data: EstimateFormValues,
    customers: { id: string; name: string; address?: string; city?: string; state?: string; zip?: string }[],
    onClose: () => void
  ) => {
    try {
      setIsSubmitting(true);
      console.log('Starting estimate submission with data:', data);

      let customerId: string | null = null;
      let customerAddress: string | null = null;
      let customerCity: string | null = null;
      let customerState: string | null = null;
      let customerZip: string | null = null;

      // Handle customer selection or creation
      if (data.isNewCustomer && data.newCustomer?.name) {
        console.log('Creating new customer:', data.newCustomer);
        
        // First generate a customer ID - using a simple format CUS-XXXXXX
        const customerIdPrefix = 'CUS-';
        const randomId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const generatedCustomerId = customerIdPrefix + randomId;
        
        // Create a new customer with the generated ID
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            customerid: generatedCustomerId, // Use generated ID
            customername: data.newCustomer.name,
            contactemail: data.newCustomer.email || null,
            phone: data.newCustomer.phone || null,
            address: data.newCustomer.address || null,
            city: data.newCustomer.city || null,
            state: data.newCustomer.state || null,
            zip: data.newCustomer.zip || null,
            createdon: new Date().toISOString(),
          })
          .select('customerid')
          .single();

        if (customerError) {
          console.error('Error creating customer:', customerError);
          throw new Error(`Error creating customer: ${customerError.message}`);
        }

        console.log('New customer created with ID:', newCustomer.customerid);
        customerId = newCustomer.customerid;
        
        // Store the new customer's address information for use in the estimate
        customerAddress = data.newCustomer.address || null;
        customerCity = data.newCustomer.city || null;
        customerState = data.newCustomer.state || null;
        customerZip = data.newCustomer.zip || null;
      } else if (data.customer) {
        console.log('Using existing customer with ID:', data.customer);
        customerId = data.customer;
        
        // Get the selected customer's address information
        const selectedCustomer = customers.find(c => c.id === data.customer);
        if (selectedCustomer) {
          customerAddress = selectedCustomer.address || null;
          customerCity = selectedCustomer.city || null; 
          customerState = selectedCustomer.state || null;
          customerZip = selectedCustomer.zip || null;
        }
      }

      // Generate our own estimate ID - using the format EST-XXXXXX
      // We'll use our new SQL function for this in production, but for now we'll simulate it
      const estimateIdPrefix = 'EST-';
      const randomId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const generatedEstimateId = estimateIdPrefix + randomId;
      
      // Determine which location data to use
      // If showSiteLocation is true, use the custom location
      // Otherwise, use the customer's address
      const locationAddress = data.showSiteLocation ? data.location.address : customerAddress;
      const locationCity = data.showSiteLocation ? data.location.city : customerCity;
      const locationState = data.showSiteLocation ? data.location.state : customerState;
      const locationZip = data.showSiteLocation ? data.location.zip : customerZip;
      
      // Create the estimate with our generated ID
      const { data: newEstimate, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          estimateid: generatedEstimateId, // Use generated ID
          customerid: customerId,
          projectname: data.project,
          "job description": data.description || null,
          customername: customerId ? 
            customers.find(c => c.id === customerId)?.name || null : 
            data.newCustomer?.name || null,
          sitelocationaddress: locationAddress,
          sitelocationcity: locationCity,
          sitelocationstate: locationState,
          sitelocationzip: locationZip,
          datecreated: new Date().toISOString(),
          status: 'draft',
          contingency_percentage: parseFloat(data.contingency_percentage || '0'),
        })
        .select('estimateid')
        .single();

      if (estimateError) {
        console.error('Error creating estimate:', estimateError);
        throw new Error(`Error creating estimate: ${estimateError.message}`);
      }

      const estimateId = newEstimate.estimateid;
      console.log('Estimate created with ID:', estimateId);

      // Create a revision for the estimate
      console.log('Creating revision for estimate');
      const { data: newRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: estimateId,
          version: 1,
          is_current: true,
          status: 'draft',
        })
        .select('id')
        .single();

      if (revisionError) {
        console.error('Error creating estimate revision:', revisionError);
        throw new Error(`Error creating estimate revision: ${revisionError.message}`);
      }

      const revisionId = newRevision.id;

      // Create the line items
      console.log('Creating line items for estimate');
      const lineItems = data.items.map(item => {
        console.log('Processing line item:', item);
        const cost = parseFloat(item.cost) || 0;
        const markup_percentage = parseFloat(item.markup_percentage) || 0;
        const markup_amount = cost * (markup_percentage / 100);
        const unit_price = cost + markup_amount;
        const quantity = parseFloat(item.quantity || '1') || 1;
        const total_price = unit_price * quantity;
        const gross_margin = markup_amount * quantity;
        const gross_margin_percentage = cost > 0 ? (markup_amount / cost) * 100 : 0;

        return {
          estimate_id: estimateId,
          revision_id: revisionId,
          description: item.description,
          item_type: item.item_type,
          cost: cost,
          markup_percentage: markup_percentage,
          markup_amount: markup_amount,
          unit_price: unit_price,
          quantity: quantity,
          total_price: total_price,
          gross_margin: gross_margin,
          gross_margin_percentage: gross_margin_percentage,
          vendor_id: item.vendor_id || null,
          subcontractor_id: item.subcontractor_id || null,
          document_id: item.document_id || null,
        };
      });

      // Insert the line items
      console.log(`Inserting ${lineItems.length} line items`);
      const { error: itemsError } = await supabase
        .from('estimate_items')
        .insert(lineItems);

      if (itemsError) {
        console.error('Error creating estimate items:', itemsError);
        throw new Error(`Error creating estimate items: ${itemsError.message}`);
      }

      // Get the temp ID used for documents
      const tempId = data.temp_id || '';

      // Update any estimate-level documents
      if (data.estimate_documents && data.estimate_documents.length > 0) {
        console.log(`Updating ${data.estimate_documents.length} documents to estimate ID: ${estimateId}`);
        
        // Update the documents to associate them with the estimate
        const { error: documentsError } = await supabase
          .from('documents')
          .update({ entity_id: estimateId })
          .in('document_id', data.estimate_documents);

        if (documentsError) {
          console.error('Error updating document associations:', documentsError);
          // Continue even if this fails - not critical
        }
      }

      // Update any documents that were tagged with the temp ID
      if (tempId) {
        console.log(`Updating documents with temp ID ${tempId} to estimate ID: ${estimateId}`);
        
        const { error: tempDocsError } = await supabase
          .from('documents')
          .update({ entity_id: estimateId })
          .eq('entity_id', tempId);
          
        if (tempDocsError) {
          console.error('Error updating temp documents:', tempDocsError);
          // Continue even if this fails - not critical
        }
      }

      // Calculate total amount
      const total = lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
      const contingencyAmount = total * (parseFloat(data.contingency_percentage || '0') / 100);
      const estimateTotal = total + contingencyAmount;
      
      // Update the estimate with the final amount
      console.log('Updating estimate with final amount:', estimateTotal);
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ 
          estimateamount: estimateTotal,
          contingencyamount: contingencyAmount
        })
        .eq('estimateid', estimateId);
      
      if (updateError) {
        console.error('Error updating estimate total:', updateError);
        // Continue even if this fails - not critical
      }

      console.log('Estimate creation completed successfully');
      toast({
        title: 'Estimate Created',
        description: 'Your estimate has been created successfully.',
      });

      onClose();
    } catch (error: any) {
      console.error('Error submitting estimate:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while creating the estimate.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitEstimate, isSubmitting };
};
