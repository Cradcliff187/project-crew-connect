import { formatCurrency } from '@/lib/utils';

interface TotalPriceDisplayProps {
  unitPrice: string;
  quantity: string;
}

const TotalPriceDisplay: React.FC<TotalPriceDisplayProps> = ({ unitPrice, quantity }) => {
  const calculateTotal = (): number => {
    const price = parseFloat(unitPrice) || 0;
    const qty = parseFloat(quantity) || 0;
    return price * qty;
  };

  const total = calculateTotal();

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-md border">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Total Price:</span>
        <span className="text-lg font-bold text-[#0485ea]">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default TotalPriceDisplay;
