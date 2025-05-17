/**
 * Calculate the total price of an estimate item
 */
export const calculateItemPrice = (item: any): number => {
  const quantity = parseFloat(item.quantity) || 1;
  const unitPrice = parseFloat(item.unit_price) || 0;
  return quantity * unitPrice;
};

/**
 * Calculate the gross margin of an estimate item
 */
export const calculateItemGrossMargin = (item: any): number => {
  const totalPrice = calculateItemPrice(item);
  const quantity = parseFloat(item.quantity) || 1;
  const cost = parseFloat(item.cost) || 0;
  const totalCost = quantity * cost;

  return totalPrice - totalCost;
};

/**
 * Calculate the gross margin percentage of an estimate item
 */
export const calculateItemGrossMarginPercentage = (item: any): number => {
  const totalPrice = calculateItemPrice(item);
  const grossMargin = calculateItemGrossMargin(item);

  if (totalPrice <= 0) return 0;
  return (grossMargin / totalPrice) * 100;
};

/**
 * Calculate line item totals for an estimate
 */
export const calculateEstimateTotals = (items: any[], contingencyPercentage = '0') => {
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = calculateItemPrice(item);
    return sum + itemPrice;
  }, 0);

  const totalCost = items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 1;
    const cost = parseFloat(item.cost) || 0;
    return sum + quantity * cost;
  }, 0);

  const grossMargin = subtotal - totalCost;
  const grossMarginPercentage = subtotal > 0 ? (grossMargin / subtotal) * 100 : 0;

  const contingencyAmount = calculateContingency(subtotal, parseFloat(contingencyPercentage));
  const grandTotal = calculateGrandTotal(subtotal, contingencyAmount);

  return {
    subtotal,
    totalCost,
    grossMargin,
    grossMarginPercentage,
    contingencyAmount,
    grandTotal,
  };
};

/**
 * Calculate contingency amount based on subtotal and percentage
 */
export const calculateContingency = (subtotal: number, percentage: number): number => {
  return subtotal * (percentage / 100);
};

/**
 * Calculate grand total with contingency
 */
export const calculateGrandTotal = (subtotal: number, contingencyAmount: number): number => {
  return subtotal + contingencyAmount;
};

/**
 * Calculate subtotal for all items
 */
export const calculateSubtotal = (items: any[]): number => {
  return items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 1;
    const unitPrice = parseFloat(item.unit_price) || 0;
    return sum + quantity * unitPrice;
  }, 0);
};

/**
 * Calculate total cost for all items
 */
export const calculateTotalCost = (items: any[]): number => {
  return items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 1;
    const cost = parseFloat(item.cost) || 0;
    return sum + quantity * cost;
  }, 0);
};

/**
 * Calculate total markup for all items
 */
import { calcMarkup } from '@/utils/finance';

export const calculateTotalMarkup = (items: any[]): number => {
  return items.reduce((sum, item) => {
    const cost = parseFloat(item.cost) || 0;
    const quantity = parseFloat(item.quantity) || 1;
    const markupPercentage = parseFloat(item.markup_percentage) || 0;
    const totalCost = cost * quantity;

    const { markupAmt } = calcMarkup(totalCost, markupPercentage);
    return sum + markupAmt;
  }, 0);
};

/**
 * Calculate total gross margin for all items
 */
export const calculateTotalGrossMargin = (items: any[]): number => {
  return items.reduce((sum, item) => {
    const grossMargin = calculateItemGrossMargin(item);
    return sum + grossMargin;
  }, 0);
};

/**
 * Calculate overall gross margin percentage
 */
export const calculateOverallGrossMarginPercentage = (items: any[]): number => {
  const subtotal = calculateSubtotal(items);
  const totalGrossMargin = calculateTotalGrossMargin(items);

  if (subtotal <= 0) return 0;
  return (totalGrossMargin / subtotal) * 100;
};

/**
 * Calculate contingency amount from items and percentage
 */
export const calculateContingencyAmount = (items: any[], contingencyPercentage: any): number => {
  const subtotal = calculateSubtotal(items);
  const percentage = parseFloat(contingencyPercentage) || 0;
  return calculateContingency(subtotal, percentage);
};
