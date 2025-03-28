
import { EstimateItem } from '../schemas/estimateFormSchema';

// Calculate the total cost for a single item
export const calculateItemCost = (item: EstimateItem): number => {
  const cost = parseFloat(item.cost || '0') || 0;
  const quantity = parseFloat(item.quantity || "1") || 1; // Default to 1 if not provided
  return cost * quantity;
};

// Calculate the markup amount for a single item
export const calculateItemMarkup = (item: EstimateItem): number => {
  const cost = calculateItemCost(item);
  const markupPercentage = parseFloat(item.markup_percentage || '0') || 0;
  return (cost * markupPercentage) / 100;
};

// Calculate the selling price for a single item
export const calculateItemPrice = (item: EstimateItem): number => {
  const cost = calculateItemCost(item);
  const markup = calculateItemMarkup(item);
  return cost + markup;
};

// Calculate the gross margin for a single item
export const calculateItemGrossMargin = (item: EstimateItem): number => {
  const price = calculateItemPrice(item);
  const cost = calculateItemCost(item);
  return price - cost;
};

// Calculate the gross margin percentage for a single item
export const calculateItemGrossMarginPercentage = (item: EstimateItem): number => {
  const price = calculateItemPrice(item);
  const margin = calculateItemGrossMargin(item);
  
  if (price === 0) return 0;
  return (margin / price) * 100;
};

// Calculate the total cost of all items
export const calculateTotalCost = (items: EstimateItem[]): number => {
  return items.reduce((total, item) => {
    return total + calculateItemCost(item);
  }, 0);
};

// Calculate the total markup amount of all items
export const calculateTotalMarkup = (items: EstimateItem[]): number => {
  return items.reduce((total, item) => {
    return total + calculateItemMarkup(item);
  }, 0);
};

// Calculate the total selling price of all items (subtotal)
export const calculateSubtotal = (items: EstimateItem[]): number => {
  return items.reduce((total, item) => {
    return total + calculateItemPrice(item);
  }, 0);
};

// Calculate the total gross margin of all items
export const calculateTotalGrossMargin = (items: EstimateItem[]): number => {
  return items.reduce((total, item) => {
    return total + calculateItemGrossMargin(item);
  }, 0);
};

// Calculate the overall gross margin percentage
export const calculateOverallGrossMarginPercentage = (items: EstimateItem[]): number => {
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
  const totalAmount = calculateSubtotal(items);
  const contingencyPercentageNum = parseFloat(contingencyPercentage) || 0;
  return (totalAmount * contingencyPercentageNum) / 100;
};

// Calculate the grand total (subtotal + contingency)
export const calculateGrandTotal = (
  items: EstimateItem[],
  contingencyPercentage: string
): number => {
  return calculateSubtotal(items) + calculateContingencyAmount(items, contingencyPercentage);
};

// Calculate the estimate totals
export const calculateEstimateTotals = (
  items: EstimateItem[],
  contingencyPercentage: string
): { totalPrice: number; contingencyAmount: number; grandTotal: number } => {
  const totalPrice = calculateSubtotal(items);
  const contingencyAmount = calculateContingencyAmount(items, contingencyPercentage);
  const grandTotal = calculateGrandTotal(items, contingencyPercentage);
  
  return {
    totalPrice,
    contingencyAmount,
    grandTotal
  };
};
