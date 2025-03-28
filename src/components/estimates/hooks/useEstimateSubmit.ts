
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

export const useEstimateSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEstimate = async (
    data: EstimateFormValues,
    customers: { id: string; name: string }[],
    onClose: () => void
  ) => {
    try {
      setIsSubmitting(true);

      const estimateId = uuidv4();
      let customerId: string | null = null;

      // Handle customer selection or creation
      if (data.isNewCustomer && data.newCustomer?.name) {
        const newCustomerId = uuidv4();
        
        // Create a new customer
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            customerid: newCustomerId,
            customername: data.newCustomer.name,
            contactemail: data.newCustomer.email || null,
            phone: data.newCustomer.phone || null,
            address: data.newCustomer.address || null,
            city: data.newCustomer.city || null,
            state: data.newCustomer.state || null,
            zip: data.newCustomer.zip || null,
            createdon: new Date().toISOString(),
          });

        if (customerError) {
          throw new Error(`Error creating customer: ${customerError.message}`);
        }

        customerId = newCustomerId;
      } else if (data.customer) {
        customerId = data.customer;
      }

      // Create the estimate
      const { error: estimateError } = await supabase
        .from('estimates')
        .insert({
          estimateid: estimateId,
          customerid: customerId,
          projectname: data.project,
          "job description": data.description || null,
          customername: customerId ? 
            customers.find(c => c.id === customerId)?.name || null : 
            data.newCustomer?.name || null,
          sitelocationaddress: data.showSiteLocation ? data.location.address || null : null,
          sitelocationcity: data.showSiteLocation ? data.location.city || null : null,
          sitelocationstate: data.showSiteLocation ? data.location.state || null : null,
          sitelocationzip: data.showSiteLocation ? data.location.zip || null : null,
          datecreated: new Date().toISOString(),
          status: 'draft',
          contingency_percentage: parseFloat(data.contingency_percentage || '0'),
        });

      if (estimateError) {
        throw new Error(`Error creating estimate: ${estimateError.message}`);
      }

      // Create a revision for the estimate
      const revisionId = uuidv4();
      const { error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          id: revisionId,
          estimate_id: estimateId,
          version: 1,
          is_current: true,
          status: 'draft',
        });

      if (revisionError) {
        throw new Error(`Error creating estimate revision: ${revisionError.message}`);
      }

      // Create the line items
      const lineItems = data.items.map(item => {
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
      const { error: itemsError } = await supabase
        .from('estimate_items')
        .insert(lineItems);

      if (itemsError) {
        throw new Error(`Error creating estimate items: ${itemsError.message}`);
      }

      // Update any estimate-level documents
      if (data.estimate_documents && data.estimate_documents.length > 0) {
        // Update the documents to associate them with the estimate
        const { error: documentsError } = await supabase
          .from('documents')
          .update({ entity_id: estimateId })
          .in('document_id', data.estimate_documents);

        if (documentsError) {
          throw new Error(`Error updating document associations: ${documentsError.message}`);
        }
      }

      // Update any line item documents that were pending
      const itemDocumentIds = data.items
        .filter(item => item.document_id)
        .map(item => item.document_id);
        
      if (itemDocumentIds.length > 0) {
        // Update the documents to associate them with the estimate
        const { error: lineItemDocsError } = await supabase
          .from('documents')
          .update({ entity_id: estimateId })
          .in('document_id', itemDocumentIds)
          .eq('entity_id', 'pending');

        if (lineItemDocsError) {
          console.error('Error updating line item document associations:', lineItemDocsError);
          // We'll continue even if this fails
        }
      }

      // Calculate total amount
      const total = lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
      const contingencyAmount = total * (parseFloat(data.contingency_percentage || '0') / 100);
      const estimateTotal = total + contingencyAmount;
      
      // Update the estimate with the final amount
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ 
          estimateamount: estimateTotal,
          contingencyamount: contingencyAmount
        })
        .eq('estimateid', estimateId);
      
      if (updateError) {
        console.error('Error updating estimate total:', updateError);
        // Continue even if this fails
      }

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
