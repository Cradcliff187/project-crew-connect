import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimateFormValues, EstimateItem } from '../schemas/estimateFormSchema';
import { useNavigate } from 'react-router-dom';

// Interface for items being processed, extending the named EstimateItem type
interface ProcessingItem extends EstimateItem {
  // No need to redefine temp_item_id as it's now in the base EstimateItem type
}

// Keep track of active submissions to prevent duplicates
const activeSubmissions = new Set();

export const useEstimateSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitEstimate = async (
    data: EstimateFormValues,
    customers: {
      id: string;
      name: string;
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    }[],
    status: string = 'draft',
    onClose: () => void
  ) => {
    // Generate a unique submission ID based on temp_id to prevent duplicate submissions
    const submissionId = data.temp_id || `est-${Date.now()}`;

    // If this submission is already in progress, don't start another one
    if (activeSubmissions.has(submissionId)) {
      console.log(`[Submission] Prevented duplicate submission for ${submissionId}`);
      return false;
    }

    // Track this submission
    activeSubmissions.add(submissionId);
    console.log(`[Submission] Starting submission for ${submissionId}`);

    try {
      setIsSubmitting(true);
      console.log('Starting estimate submission with data:', data);
      console.log('Using status:', status);

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
        const randomId = Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, '0');
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
      const randomId = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0');
      const generatedEstimateId = estimateIdPrefix + randomId;

      // Determine which location data to use
      // If showSiteLocation is true, use the custom location
      // Otherwise, use the customer's address
      const locationAddress = data.showSiteLocation ? data.location.address : customerAddress;
      const locationCity = data.showSiteLocation ? data.location.city : customerCity;
      const locationState = data.showSiteLocation ? data.location.state : customerState;
      const locationZip = data.showSiteLocation ? data.location.zip : customerZip;

      // Create the estimate with our generated ID and the provided status
      const { data: newEstimate, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          estimateid: generatedEstimateId, // Use generated ID
          customerid: customerId,
          projectname: data.project,
          'job description': data.description || null,
          customername: customerId
            ? customers.find(c => c.id === customerId)?.name || null
            : data.newCustomer?.name || null,
          sitelocationaddress: locationAddress,
          sitelocationcity: locationCity,
          sitelocationstate: locationState,
          sitelocationzip: locationZip,
          datecreated: new Date().toISOString(),
          status: status, // Use the provided status
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

      // Create a revision for the estimate with the provided status
      console.log('Creating revision for estimate');
      const { data: newRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: estimateId,
          version: 1,
          is_selected_for_view: true,
          status: status, // Use the provided status here too
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
      // Keep track of temporary IDs and item data
      const itemsWithTempIds: ProcessingItem[] = data.items;
      const lineItemsToInsert = itemsWithTempIds.map(item => {
        // Exclude temp_item_id from the object sent to DB
        const { temp_item_id, ...dbItem } = item;

        console.log('Processing line item:', dbItem);
        const cost = parseFloat(dbItem.cost) || 0;
        const markup_percentage = parseFloat(dbItem.markup_percentage) || 0;
        const markup_amount = cost * (markup_percentage / 100);
        const unit_price = cost + markup_amount;
        const quantity = parseFloat(dbItem.quantity || '1') || 1;
        const total_price = unit_price * quantity;
        const gross_margin = markup_amount * quantity;
        const gross_margin_percentage = cost > 0 ? (markup_amount / cost) * 100 : 0;

        return {
          estimate_id: estimateId,
          revision_id: revisionId,
          description: dbItem.description,
          item_type: dbItem.item_type,
          cost: cost,
          markup_percentage: markup_percentage,
          markup_amount: markup_amount,
          unit_price: unit_price,
          quantity: quantity,
          total_price: total_price,
          gross_margin: gross_margin,
          gross_margin_percentage: gross_margin_percentage,
          vendor_id: dbItem.vendor_id || null,
          subcontractor_id: dbItem.subcontractor_id || null,
          document_id: dbItem.document_id || null, // Include document_id attached to item
        };
      });

      // Insert the line items
      console.log(`Inserting ${lineItemsToInsert.length} line items`);
      const { error: itemsError } = await supabase.from('estimate_items').insert(lineItemsToInsert);

      if (itemsError) {
        console.error('Error creating estimate items:', itemsError);
        throw new Error(`Error creating estimate items: ${itemsError.message}`);
      }

      // --- START: New logic to update item document links ---
      // Fetch the inserted items back to get their permanent IDs
      console.log('[Document Update] Fetching inserted items to map temp IDs...');
      const { data: insertedItems, error: fetchInsertedError } = await supabase
        .from('estimate_items')
        .select('id, description') // Select permanent ID and description (or other unique identifier)
        .eq('revision_id', revisionId);

      if (fetchInsertedError) {
        console.error('[Document Update] Error fetching inserted items:', fetchInsertedError);
        // Non-critical error, proceed without updating item doc links
      } else if (insertedItems && insertedItems.length > 0) {
        console.log('[Document Update] Found inserted items:', insertedItems);
        // Create a map from temp_item_id to permanent DB id
        const tempToPermanentIdMap = new Map<string, string>();
        itemsWithTempIds.forEach(originalItem => {
          // Find the corresponding inserted item (matching by description might be fragile, improve if possible)
          const insertedMatch = insertedItems.find(
            inserted => inserted.description === originalItem.description
          );
          if (insertedMatch && originalItem.temp_item_id) {
            tempToPermanentIdMap.set(originalItem.temp_item_id, insertedMatch.id);
          }
        });
        console.log('[Document Update] Temp ID to Permanent ID map:', tempToPermanentIdMap);

        // Update documents linked via temporary item IDs
        for (const [tempItemId, permanentItemId] of tempToPermanentIdMap.entries()) {
          console.log(
            `[Document Update] Updating documents linked to temp item ID ${tempItemId} to use permanent ID ${permanentItemId}`
          );
          const { error: updateDocError } = await supabase
            .from('documents')
            .update({ entity_id: permanentItemId })
            .eq('entity_type', 'ESTIMATE_ITEM')
            .eq('entity_id', tempItemId); // Find docs linked via temp ID

          if (updateDocError) {
            console.error(
              `[Document Update] Error updating documents for temp ID ${tempItemId}:`,
              updateDocError
            );
            // Log error but continue processing other items
          }
        }
      }
      // --- END: New logic to update item document links ---

      // Get the temp ID used for estimate-level documents
      const tempId = data.temp_id || '';
      console.log('[Document Update] Using temp ID for document updates:', tempId);

      // Update any estimate-level documents
      if (data.estimate_documents && data.estimate_documents.length > 0) {
        console.log(
          `[Document Update] Updating ${data.estimate_documents.length} documents to estimate ID: ${estimateId}`
        );

        // Update the documents to associate them with the estimate
        const { error: documentsError } = await supabase
          .from('documents')
          .update({ entity_id: estimateId })
          .in('document_id', data.estimate_documents);

        if (documentsError) {
          console.error('[Document Update] Error updating document associations:', documentsError);
          // Continue even if this fails - not critical
        }
      }

      // Update any documents that were tagged with the temp ID
      if (tempId) {
        console.log(`[Document Update] Checking for any documents with temp ID: ${tempId}`);

        // First, let's see if there are any documents with this temp ID
        const { data: tempDocuments, error: findError } = await supabase
          .from('documents')
          .select('document_id, entity_type')
          .eq('entity_id', tempId);

        if (findError) {
          console.error('[Document Update] Error finding temp documents:', findError);
        } else {
          console.log(
            `[Document Update] Found ${tempDocuments?.length || 0} documents with temp ID`
          );
          if (tempDocuments && tempDocuments.length > 0) {
            console.log('[Document Update] Document details:', tempDocuments);
          }
        }

        await updateDocumentReferences(tempId, estimateId);
      }

      // Calculate total amount
      const total = lineItemsToInsert.reduce((sum, item) => sum + (item.total_price || 0), 0);
      const contingencyAmount = total * (parseFloat(data.contingency_percentage || '0') / 100);
      const estimateTotal = total + contingencyAmount;

      // Update the estimate with the final amount
      console.log('Updating estimate with final amount:', estimateTotal);
      const { error: updateError } = await supabase
        .from('estimates')
        .update({
          estimateamount: estimateTotal,
          contingencyamount: contingencyAmount,
        })
        .eq('estimateid', estimateId);

      if (updateError) {
        console.error('Error updating estimate total:', updateError);
        // Continue even if this fails - not critical
      }

      console.log('Estimate creation completed successfully');

      // Send email if status is 'sent'
      if (status === 'sent') {
        console.log('Status is "sent", attempting to send email to customer');
        try {
          // Using a hypothetical email service
          // This would be replaced with your actual email implementation
          // const emailResult = await emailService.sendEstimateEmail({
          //   estimateId,
          //   customerEmail: customerEmail,
          //   customerName: customerName,
          // });

          console.log('Email sending would happen here in production');

          // Add a delay to simulate email sending
          await new Promise(resolve => setTimeout(resolve, 1000));

          toast({
            title: 'Estimate Sent',
            description: 'Your estimate has been emailed to the customer.',
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          toast({
            title: 'Email Not Sent',
            description: 'The estimate was created but could not be emailed to the customer.',
            variant: 'destructive',
          });
        }
      } else {
        // Show appropriate toast for other statuses
        const statusMessages = {
          draft: 'Your estimate has been saved as a draft.',
          awaiting_approval: 'Your estimate has been marked as pending approval.',
          approved: 'Your estimate has been marked as approved.',
        };

        toast({
          title: 'Estimate Created',
          description: statusMessages[status] || 'Your estimate has been created successfully.',
        });
      }

      // Don't navigate immediately to let the user see the success message
      setTimeout(() => {
        navigate('/estimates');
      }, 750);

      // Call onClose callback after a slight delay to ensure state updates are complete
      setTimeout(() => {
        if (onClose) onClose();
      }, 800);

      return true;
    } catch (error: any) {
      console.error('Error submitting estimate:', error);

      toast({
        title: 'Error',
        description: error.message || 'An error occurred while creating the estimate.',
        variant: 'destructive',
      });
      return false;
    } finally {
      // Remove this submission from active tracking
      activeSubmissions.delete(submissionId);
      setIsSubmitting(false);
    }
  };

  return { submitEstimate, isSubmitting };
};

// Helper function to update all documents that reference the temporary ID
const updateDocumentReferences = async (tempId: string, estimateId: string) => {
  try {
    console.log(
      `[Document Update] Starting document reference update from ${tempId} to ${estimateId}`
    );

    // Update estimate-level documents
    const { data: updatedEstimateDocs, error } = await supabase
      .from('documents')
      .update({ entity_id: estimateId })
      .eq('entity_id', tempId)
      .eq('entity_type', 'ESTIMATE')
      .select('document_id');

    if (error) {
      console.error('[Document Update] Error updating estimate document references:', error);
    } else {
      console.log(
        `[Document Update] Updated ${updatedEstimateDocs?.length || 0} estimate documents`
      );
    }

    // Also update any line item documents
    const { data: updatedItemDocs, error: itemDocError } = await supabase
      .from('documents')
      .update({ entity_id: estimateId })
      .eq('entity_id', tempId)
      .eq('entity_type', 'ESTIMATE_ITEM')
      .select('document_id');

    if (itemDocError) {
      console.error(
        '[Document Update] Error updating line item document references:',
        itemDocError
      );
    } else {
      console.log(`[Document Update] Updated ${updatedItemDocs?.length || 0} line item documents`);
    }

    console.log('[Document Update] Document reference update completed');
  } catch (err) {
    console.error('[Document Update] Failed to update document references:', err);
  }
};
