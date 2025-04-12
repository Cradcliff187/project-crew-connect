
import { useState, useEffect, useRef } from 'react';
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
  
  // Cache calculation results to prevent unnecessary re-renders
  const [calculatedValues, setCalculatedValues] = useState<CalculatedValues>({
    itemPrice: 0,
    grossMargin: 0,
    grossMarginPercentage: 0
  });
  
  // Use ref to track if values have changed to prevent recalculation
  const prevValuesRef = useRef<string>('');
  
  // Get the field values once at the beginning and when specific fields change
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
    
    // Subscribe to changes for this item only - with minimal resubscription
    const unsubscribe = form.watch((value, { name }) => {
      if (!name || !name.startsWith(`items.${index}.`)) return;
      
      const field = name.split('.').pop();
      if (!field) return;
      
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
    });
    
    return () => unsubscribe();
  }, [form, index]);
  
  // Calculate derived values - but only when relevant values change
  useEffect(() => {
    // Create a string representation of the values that affect calculations
    const currentValues = `${itemValues.cost}-${itemValues.quantity}-${itemValues.unitPrice}`;
    
    // Skip calculation if values haven't changed
    if (currentValues === prevValuesRef.current) return;
    
    // Cache the new values
    prevValuesRef.current = currentValues;
    
    // Get numeric values
    const unitPrice = parseFloat(itemValues.unitPrice) || 0;
    const quantity = parseFloat(itemValues.quantity) || 1;
    const cost = parseFloat(itemValues.cost) || 0;
    
    // Calculate item price
    const itemPrice = unitPrice * quantity;
    
    // Calculate margin values
    const totalCost = cost * quantity;
    const grossMargin = itemPrice - totalCost;
    const grossMarginPercentage = itemPrice > 0 
      ? (grossMargin / itemPrice) * 100 
      : 0;
    
    // Update calculated values in a single state update
    setCalculatedValues({
      itemPrice,
      grossMargin,
      grossMarginPercentage
    });
  }, [itemValues.cost, itemValues.quantity, itemValues.unitPrice]);
  
  return { itemValues, calculatedValues };
};

export default useItemValues;
