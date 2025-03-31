
import { EstimateItem } from '../schemas/estimateFormSchema';

// Add logging to help debug calculation issues
const logCalculation = (name: string, input: any, result: number) => {
  console.log(`${name} calculation:`, { input, result });
  return result;
};

// Calculate the total cost for a single item
export const calculateItemCost = (item: EstimateItem): number => {
  if (!item) {
    console.warn('calculateItemCost called with undefined item');
    return 0;
  }
  
  const cost = parseFloat(item.cost || '0') || 0;
  const quantity = parseFloat(item.quantity || "1") || 1; // Default to 1 if not provided
  return logCalculation('ItemCost', { cost, quantity }, cost * quantity);
};

// Calculate the markup amount for a single item
export const calculateItemMarkup = (item: EstimateItem): number => {
  if (!item) {
    console.warn('calculateItemMarkup called with undefined item');
    return 0;
  }
  
  const cost = calculateItemCost(item);
  const markupPercentage = parseFloat(item.markup_percentage || '0') || 0;
  return logCalculation('ItemMarkup', { cost, markupPercentage }, (cost * markupPercentage) / 100);
};

// Calculate the selling price for a single item
export const calculateItemPrice = (item: EstimateItem): number => {
  if (!item) {
    console.warn('calculateItemPrice called with undefined item');
    return 0;
  }
  
  const cost = calculateItemCost(item);
  const markup = calculateItemMarkup(item);
  return logCalculation('ItemPrice', { cost, markup }, cost + markup);
};

// Calculate the gross margin for a single item
export const calculateItemGrossMargin = (item: EstimateItem): number => {
  if (!item) {
    console.warn('calculateItemGrossMargin called with undefined item');
    return 0;
  }
  
  const price = calculateItemPrice(item);
  const cost = calculateItemCost(item);
  return logCalculation('ItemGrossMargin', { price, cost }, price - cost);
};

// Calculate the gross margin percentage for a single item
export const calculateItemGrossMarginPercentage = (item: EstimateItem): number => {
  if (!item) {
    console.warn('calculateItemGrossMarginPercentage called with undefined item');
    return 0;
  }
  
  const price = calculateItemPrice(item);
  const margin = calculateItemGrossMargin(item);
  
  if (price === 0) return 0;
  return logCalculation('ItemGrossMarginPercentage', { margin, price }, (margin / price) * 100);
};

// Calculate the total cost of all items
export const calculateTotalCost = (items: EstimateItem[]): number => {
  if (!Array.isArray(items)) {
    console.warn('calculateTotalCost called with non-array items:', items);
    return 0;
  }
  
  const result = items.reduce((total, item) => {
    return total + calculateItemCost(item);
  }, 0);
  
  return logCalculation('TotalCost', { itemsCount: items.length }, result);
};

// Calculate the total markup amount of all items
export const calculateTotalMarkup = (items: EstimateItem[]): number => {
  if (!Array.isArray(items)) {
    console.warn('calculateTotalMarkup called with non-array items:', items);
    return 0;
  }
  
  const result = items.reduce((total, item) => {
    return total + calculateItemMarkup(item);
  }, 0);
  
  return logCalculation('TotalMarkup', { itemsCount: items.length }, result);
};

// Calculate the total selling price of all items (subtotal)
export const calculateSubtotal = (items: EstimateItem[]): number => {
  if (!Array.isArray(items)) {
    console.warn('calculateSubtotal called with non-array items:', items);
    return 0;
  }
  
  const result = items.reduce((total, item) => {
    return total + calculateItemPrice(item);
  }, 0);
  
  return logCalculation('Subtotal', { itemsCount: items.length }, result);
};

// Calculate the total gross margin of all items
export const calculateTotalGrossMargin = (items: EstimateItem[]): number => {
  if (!Array.isArray(items)) {
    console.warn('calculateTotalGrossMargin called with non-array items:', items);
    return 0;
  }
  
  const result = items.reduce((total, item) => {
    return total + calculateItemGrossMargin(item);
  }, 0);
  
  return logCalculation('TotalGrossMargin', { itemsCount: items.length }, result);
};

// Calculate the overall gross margin percentage
export const calculateOverallGrossMarginPercentage = (items: EstimateItem[]): number => {
  if (!Array.isArray(items)) {
    console.warn('calculateOverallGrossMarginPercentage called with non-array items:', items);
    return 0;
  }
  
  const subtotal = calculateSubtotal(items);
  const totalGrossMargin = calculateTotalGrossMargin(items);
  
  if (subtotal === 0) return 0;
  
  const result = (totalGrossMargin / subtotal) * 100;
  return logCalculation('OverallGrossMarginPercentage', { totalGrossMargin, subtotal }, result);
};

// Calculate contingency amount based on the subtotal
export const calculateContingencyAmount = (
  items: EstimateItem[],
  contingencyPercentage: string
): number => {
  if (!Array.isArray(items)) {
    console.warn('calculateContingencyAmount called with non-array items:', items);
    return 0;
  }
  
  const totalAmount = calculateSubtotal(items);
  const contingencyPercentageNum = parseFloat(contingencyPercentage) || 0;
  
  const result = (totalAmount * contingencyPercentageNum) / 100;
  return logCalculation('ContingencyAmount', { totalAmount, contingencyPercentageNum }, result);
};

// Calculate the grand total (subtotal + contingency)
export const calculateGrandTotal = (
  items: EstimateItem[],
  contingencyPercentage: string
): number => {
  if (!Array.isArray(items)) {
    console.warn('calculateGrandTotal called with non-array items:', items);
    return 0;
  }
  
  const result = calculateSubtotal(items) + calculateContingencyAmount(items, contingencyPercentage);
  return logCalculation('GrandTotal', { 
    subtotal: calculateSubtotal(items), 
    contingency: calculateContingencyAmount(items, contingencyPercentage) 
  }, result);
};

// Calculate the estimate totals
export const calculateEstimateTotals = (
  items: EstimateItem[],
  contingencyPercentage: string
): { totalPrice: number; contingencyAmount: number; grandTotal: number } => {
  if (!Array.isArray(items)) {
    console.warn('calculateEstimateTotals called with non-array items:', items);
    return { totalPrice: 0, contingencyAmount: 0, grandTotal: 0 };
  }
  
  const totalPrice = calculateSubtotal(items);
  const contingencyAmount = calculateContingencyAmount(items, contingencyPercentage);
  const grandTotal = calculateGrandTotal(items, contingencyPercentage);
  
  const result = {
    totalPrice,
    contingencyAmount,
    grandTotal
  };
  
  console.log('EstimateTotals calculation result:', result);
  
  return result;
};
