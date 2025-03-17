
export const calculateItemTotal = (quantity: string, unitPrice: string): number => {
  const quantityNum = parseFloat(quantity) || 0;
  const unitPriceNum = parseFloat(unitPrice) || 0;
  return quantityNum * unitPriceNum;
};

export const calculateSubtotal = (items: { quantity: string; unitPrice: string }[]): number => {
  return items.reduce((total, item) => {
    return total + calculateItemTotal(item.quantity, item.unitPrice);
  }, 0);
};

export const calculateContingencyAmount = (
  items: { quantity: string; unitPrice: string }[],
  contingencyPercentage: string
): number => {
  const totalAmount = calculateSubtotal(items);
  const contingencyPercentageNum = parseFloat(contingencyPercentage) || 0;
  return (totalAmount * contingencyPercentageNum) / 100;
};

export const calculateGrandTotal = (
  items: { quantity: string; unitPrice: string }[],
  contingencyPercentage: string
): number => {
  return calculateSubtotal(items) + calculateContingencyAmount(items, contingencyPercentage);
};
