import { formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  <span className="text-primary">{formatCurrency(total)}</span>
                </span>
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default TotalPriceDisplay;
