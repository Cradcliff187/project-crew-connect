
import { supabase } from '@/integrations/supabase/client';
import { EstimateFormValues, EstimateItem } from '../schemas/estimateFormSchema';
import { 
  calculateItemCost, 
  calculateItemMarkup, 
  calculateItemPrice, 
  calculateItemGrossMargin, 
  calculateItemGrossMarginPercentage, 
  calculateSubtotal 
} from './estimateCalculations';
import { uploadItemDocument, updateDocumentEntityId } from './estimateDocumentUtils';

/**
 * Prepares and submits an estimate to the database
 */
export const submitEstimateToDatabase = async (
  data: EstimateFormValues, 
  customers: { id: string; name: string }[]
): Promise<string> => {
  console.log("Submitting estimate with data:", data);
  
  // Make sure items match the EstimateItem type for calculations
  const typedItems: EstimateItem[] = data.items.map(item => ({
    cost: item.cost,
    markup_percentage: item.markup_percentage,
    quantity: item.quantity,
    item_type: item.item_type
  }));
  
  // Calculate the total amount
  const totalAmount = calculateSubtotal(typedItems);
  
  // Parse contingency percentage as a number (defaults to 0 if empty)
  const contingencyPercentage = parseFloat(data.contingency_percentage || '0');
  
  // Find the customer by ID to get the name
  const customer = customers.find(c => c.id === data.customer);
  const customerName = customer?.name || 'Unknown Client';
  console.log("Customer name for the estimate:", customerName);
  
  // Generate a temporary ID for TypeScript
  const tempEstimateId = `EST-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  // Prepare the estimate data object with the proper field structure
  const estimateData = {
    estimateid: tempEstimateId, // Include this for TypeScript, the trigger will replace it
    customerid: data.customer,
    customername: customerName,
    "job description": data.description,
    estimateamount: totalAmount,
    contingency_percentage: contingencyPercentage,
    sitelocationaddress: data.location.address || '',
    sitelocationcity: data.location.city || '',
    sitelocationstate: data.location.state || '',
    sitelocationzip: data.location.zip || '',
    datecreated: new Date().toISOString(),
    status: 'draft',
    isactive: true,
    projectname: data.project
  };
  
  console.log("Submitting estimate data to Supabase:", estimateData);
  
  // Insert the estimate into the database
  const { data: insertedData, error: estimateError } = await supabase
    .from('estimates')
    .insert(estimateData)
    .select();

  if (estimateError) {
    console.error("Error inserting estimate:", estimateError);
    throw estimateError;
  }
  
  if (!insertedData || insertedData.length === 0) {
    throw new Error('Failed to create estimate - no ID returned');
  }
  
  console.log("Estimate created:", insertedData);
  return insertedData[0].estimateid;
};

/**
 * Prepares and submits estimate items to the database
 */
export const submitEstimateItems = async (
  data: EstimateFormValues,
  estimateId: string
): Promise<void> => {
  // Prepare and update any pre-uploaded documents with the new estimate ID
  await Promise.all(data.items.map(async (item) => {
    if (item.document && typeof item.document === 'string') {
      // If document is a string, it's a document ID that needs to be updated
      await updateDocumentEntityId(item.document, estimateId);
    }
  }));

  // Prepare and upload documents first, then insert estimate items
  const estimateItems = await Promise.all(data.items.map(async (item, index) => {
    // Upload document if provided and it's a File object
    let documentId = null;
    if (item.document && item.document instanceof File) {
      documentId = await uploadItemDocument(item.document, estimateId, index);
    } else if (item.document && typeof item.document === 'string') {
      // If it's already a document ID (from a previous upload)
      documentId = item.document;
    }
    
    const typedItem: EstimateItem = {
      cost: item.cost,
      markup_percentage: item.markup_percentage,
      quantity: item.quantity || '1'
    };
    
    // Calculate all the derived values
    const cost = calculateItemCost(typedItem);
    const markupAmount = calculateItemMarkup(typedItem);
    const totalPrice = calculateItemPrice(typedItem);
    const grossMargin = calculateItemGrossMargin(typedItem);
    const grossMarginPercentage = calculateItemGrossMarginPercentage(typedItem);
    
    return {
      estimate_id: estimateId,
      description: item.description,
      quantity: parseFloat(item.quantity || '1'),
      unit_price: totalPrice / (parseFloat(item.quantity || '1') || 1), // Unit price is the price per unit
      total_price: totalPrice,
      item_type: item.item_type,
      cost: cost,
      markup_percentage: parseFloat(item.markup_percentage || '0'),
      vendor_id: item.item_type === 'vendor' ? item.vendor_id : null,
      subcontractor_id: item.item_type === 'subcontractor' ? item.subcontractor_id : null,
      document_id: documentId
    };
  }));

  console.log("Inserting estimate items:", estimateItems);
  const { error: itemsError } = await supabase
    .from('estimate_items')
    .insert(estimateItems);

  if (itemsError) {
    console.error("Error inserting estimate items:", itemsError);
    throw itemsError;
  }
};
