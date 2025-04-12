
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { EstimateFormValues } from '../../../schemas/estimateFormSchema';

interface ItemValues {
  itemType: string;
  cost: string;
  markupPercentage: string;
  quantity: string;
  unitPrice: string;
  description: string;
  documentId: string;
  vendorId: string;
  subcontractorId: string;
}

interface CalculatedValues {
  itemPrice: number;
  grossMargin: number;
  grossMarginPercentage: number;
}

const useItemValues = (index: number, form: UseFormReturn<EstimateFormValues>) => {
  // Use local state to store item values
  const [itemValues, setItemValues] = useState<ItemValues>({
    itemType: 'labor',
    cost: '0',
    markupPercentage: '20',
    quantity: '1',
    unitPrice: '0',
    description: '',
    documentId: '',
    vendorId: '',
    subcontractorId: ''
  });
  
  // Get the field values once at the beginning
  useEffect(() => {
    const values = {
      itemType: form.getValues(`items.${index}.item_type`) || 'labor',
      cost: form.getValues(`items.${index}.cost`) || '0',
      markupPercentage: form.getValues(`items.${index}.markup_percentage`) || '20',
      quantity: form.getValues(`items.${index}.quantity`) || '1',
      unitPrice: form.getValues(`items.${index}.unit_price`) || '0',
      description: form.getValues(`items.${index}.description`) || '',
      documentId: form.getValues(`items.${index}.document_id`) || '',
      vendorId: form.getValues(`items.${index}.vendor_id`) || '',
      subcontractorId: form.getValues(`items.${index}.subcontractor_id`) || ''
    };
    
    setItemValues(values);
    
    // Subscribe to changes for this item only
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith(`items.${index}.`)) {
        const field = name.split('.').pop();
        
        if (field) {
          let keyName: keyof ItemValues;
          
          switch(field) {
            case 'item_type':
              keyName = 'itemType';
              break;
            case 'markup_percentage':
              keyName = 'markupPercentage';
              break;
            case 'unit_price':
              keyName = 'unitPrice';
              break;
            case 'document_id':
              keyName = 'documentId';
              break;
            case 'vendor_id':
              keyName = 'vendorId';
              break;
            case 'subcontractor_id':
              keyName = 'subcontractorId';
              break;
            default:
              keyName = field as keyof ItemValues;
          }
          
          // Update only the changed field
          setItemValues(prev => ({
            ...prev,
            [keyName]: value.items?.[index]?.[field] ?? prev[keyName]
          }));
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, index]);
  
  // Calculate derived values
  const calculatedValues: CalculatedValues = {
    itemPrice: parseFloat(itemValues.unitPrice) * parseFloat(itemValues.quantity || '1'),
    grossMargin: 0,
    grossMarginPercentage: 0
  };
  
  // Calculate margin values
  const costValue = parseFloat(itemValues.cost) || 0;
  const quantityValue = parseFloat(itemValues.quantity) || 1;
  const totalCost = costValue * quantityValue;
  
  calculatedValues.grossMargin = calculatedValues.itemPrice - totalCost;
  calculatedValues.grossMarginPercentage = calculatedValues.itemPrice > 0 
    ? (calculatedValues.grossMargin / calculatedValues.itemPrice) * 100 
    : 0;
  
  return { itemValues, calculatedValues };
};

export default useItemValues;
