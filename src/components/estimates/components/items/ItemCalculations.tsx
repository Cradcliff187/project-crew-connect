
import { FormItem, FormLabel } from '@/components/ui/form';

interface ItemCalculationsProps {
  itemPrice: number;
  grossMargin: number;
  grossMarginPercentage: number;
}

const ItemCalculations = ({ itemPrice, grossMargin, grossMarginPercentage }: ItemCalculationsProps) => {
  return (
    <>
      <div className="col-span-6 md:col-span-2">
        <FormItem>
          <FormLabel>Price</FormLabel>
          <div className="h-10 px-3 py-2 rounded-md border border-input bg-gray-50 text-right">
            ${itemPrice.toFixed(2)}
          </div>
        </FormItem>
      </div>

      <div className="col-span-6 md:col-span-2">
        <FormItem>
          <FormLabel>Gross Margin</FormLabel>
          <div className="h-10 px-3 py-2 rounded-md border border-input bg-gray-50 text-right">
            ${grossMargin.toFixed(2)} ({grossMarginPercentage.toFixed(1)}%)
          </div>
        </FormItem>
      </div>
    </>
  );
};

export default ItemCalculations;
