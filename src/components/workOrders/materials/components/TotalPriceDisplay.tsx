import { formatCurrency } from '@/lib/utils';

interface TotalPriceDisplayProps {
  unitPrice: string;
  quantity: string;
}

const TotalPriceDisplay = ({ unitPrice, quantity }: TotalPriceDisplayProps) => {
  if (!unitPrice || !quantity) return null;

  const total = parseFloat(unitPrice || '0') * parseFloat(quantity || '0');

  return (
    <div className="mt-4 text-right">
      <p className="text-sm font-medium">Total: {formatCurrency(total)}</p>
    </div>
  );
};

export default TotalPriceDisplay;
