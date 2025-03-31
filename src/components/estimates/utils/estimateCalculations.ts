
import { EstimateItem } from '../schemas/estimateFormSchema';

// Calculate the total cost for a single item
export const calculateItemCost = (item: EstimateItem): number => {
  if (!item) {
    return 0;
  }
  
  const cost = parseFloat(item.cost || '0') || 0;
  const quantity = parseFloat(item.quantity || "1") || 1; // Default to 1 if not provided
  return cost * quantity;
};

// Calculate the markup amount for a single item
export const calculateItemMarkup = (item: EstimateItem): number => {
  if (!item) {
    return 0;
  }
  
  const cost = calculateItemCost(item);
  const markupPercentage = parseFloat(item.markup_percentage || '0') || 0;
  return (cost * markupPercentage) / 100;
};

// Calculate the selling price for a single item
export const calculateItemPrice = (item: EstimateItem): number => {
  if (!item) {
    return 0;
  }
  
  const cost = calculateItemCost(item);
  const markup = calculateItemMarkup(item);
  return cost + markup;
};

// Calculate the gross margin for a single item
export const calculateItemGrossMargin = (item: EstimateItem): number => {
  if (!item) {
    return 0;
  }
  
  const price = calculateItemPrice(item);
  const cost = calculateItemCost(item);
  return price - cost;
};

// Calculate the gross margin percentage for a single item
export const calculateItemGrossMarginPercentage = (item: EstimateItem): number => {
  if (!item) {
    return 0;
  }
  
  const price = calculateItemPrice(item);
  const margin = calculateItemGrossMargin(item);
  
  if (price === 0) return 0;
  return (margin / price) * 100;
};

// Calculate the total cost of all items
export const calculateTotalCost = (items: EstimateItem[]): number => {
  if (!Array.isArray(items)) {
    return 0;
  }
  
  return items.reduce((total, item) => {
    return total + calculateItemCost(item);
  }, 0);
};

// Calculate the total markup amount of all items
export const calculateTotalMarkup = (items: EstimateItem[]): number => {
  if (!Array.isArray(items)) {
    return 0;
  }
  
  return items.reduce((total, item) => {
    return total + calculateItemMarkup(item);
  }, 0);
};

// Calculate the total selling price of all items (subtotal)
export const calculateSubtotal = (items: EstimateItem[]): number => {
  if (!Array.isArray(items)) {
    return 0;
  }
  
  return items.reduce((total, item) => {
    return total + calculateItemPrice(item);
  }, 0);
};

// Calculate the total gross margin of all items
export const calculateTotalGrossMargin = (items: EstimateItem[]): number => {
  if (!Array.isArray(items)) {
    return 0;
  }
  
  return items.reduce((total, item) => {
    return total + calculateItemGrossMargin(item);
  }, 0);
};

// Calculate the overall gross margin percentage
export const calculateOverallGrossMarginPercentage = (items: EstimateItem[]): number => {
  if (!Array.isArray(items)) {
    return 0;
  }
  
  const subtotal = calculateSubtotal(items);
  const totalGrossMargin = calculateTotalGrossMargin(items);
  
  if (subtotal === 0) return 0;
  return (totalGrossMargin / subtotal) * 100;
};

// Calculate contingency amount based on the subtotal
export const calculateContingencyAmount = (
  items: EstimateItem[],
  contingencyPercentage: string
): number => {
  if (!Array.isArray(items)) {
    return 0;
  }
  
  const totalAmount = calculateSubtotal(items);
  const contingencyPercentageNum = parseFloat(contingencyPercentage) || 0;
  
  return (totalAmount * contingencyPercentageNum) / 100;
};

// Calculate the grand total (subtotal + contingency)
export const calculateGrandTotal = (
  items: EstimateItem[],
  contingencyPercentage: string
): number => {
  if (!Array.isArray(items)) {
    return 0;
  }
  
  return calculateSubtotal(items) + calculateContingencyAmount(items, contingencyPercentage);
};

// Calculate the estimate totals
export const calculateEstimateTotals = (
  items: EstimateItem[],
  contingencyPercentage: string
): { totalPrice: number; contingencyAmount: number; grandTotal: number } => {
  if (!Array.isArray(items)) {
    return { totalPrice: 0, contingencyAmount: 0, grandTotal: 0 };
  }
  
  // Ensure all required properties have values
  const safeItems = items.map(item => ({
    cost: item.cost || '0',
    markup_percentage: item.markup_percentage || '0',
    quantity: item.quantity || '1',
    item_type: item.item_type,
    trade_type: item.trade_type,
    expense_type: item.expense_type,
    custom_type: item.custom_type,
    vendor_id: item.vendor_id,
    subcontractor_id: item.subcontractor_id,
    document_id: item.document_id
  }));
  
  const totalPrice = calculateSubtotal(safeItems);
  const contingencyAmount = calculateContingencyAmount(safeItems, contingencyPercentage);
  const grandTotal = calculateGrandTotal(safeItems, contingencyPercentage);
  
  return {
    totalPrice,
    contingencyAmount,
    grandTotal
  };
};
