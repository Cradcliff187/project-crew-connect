
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
export const calculateEstimateTotals = (items: any[]) => {
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
  const totalCost = items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 1;
    const cost = parseFloat(item.cost) || 0;
    return sum + (quantity * cost);
  }, 0);
  
  const grossMargin = subtotal - totalCost;
  const grossMarginPercentage = subtotal > 0 ? (grossMargin / subtotal) * 100 : 0;
  
  return {
    subtotal,
    totalCost,
    grossMargin,
    grossMarginPercentage
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
