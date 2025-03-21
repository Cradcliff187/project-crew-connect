
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { 
  calculateItemPrice, 
  calculateItemGrossMargin, 
  calculateItemGrossMarginPercentage 
} from '../../utils/estimateCalculations';

import ItemDescription from './ItemDescription';
import ItemTypeSelector from './ItemTypeSelector';
import VendorSelector from './VendorSelector';
import SubcontractorSelector from './SubcontractorSelector';
import CostFields from './CostFields';
import ItemCalculations from './ItemCalculations';

type Vendor = { vendorid: string; vendorname: string };
type Subcontractor = { subid: string; subname: string };

interface EstimateItemRowProps {
  index: number;
  vendors: Vendor[];
  subcontractors: Subcontractor[];
  loading: boolean;
  onRemove: () => void;
  canRemove: boolean;
}

const EstimateItemRow = ({ 
  index, 
  vendors, 
  subcontractors, 
  loading, 
  onRemove, 
  canRemove 
}: EstimateItemRowProps) => {
  const form = useFormContext<EstimateFormValues>();

  // Get current values for calculations and display
  const itemType = useWatch({
    control: form.control,
    name: `items.${index}.item_type`,
    defaultValue: 'labor'
  });

  const cost = useWatch({
    control: form.control,
    name: `items.${index}.cost`,
    defaultValue: '0'
  });

  const markupPercentage = useWatch({
    control: form.control,
    name: `items.${index}.markup_percentage`,
    defaultValue: '0'
  });
  
  const quantity = useWatch({
    control: form.control,
    name: `items.${index}.quantity`,
    defaultValue: '1'
  });

  // Calculate derived values for display
  const item = { cost, markup_percentage: markupPercentage, quantity };
  const itemPrice = calculateItemPrice(item);
  const grossMargin = calculateItemGrossMargin(item);
  const grossMarginPercentage = calculateItemGrossMarginPercentage(item);

  // Handle type change to reset vendor/subcontractor fields
  const handleTypeChange = (value: string) => {
    if (value === 'vendor') {
      form.setValue(`items.${index}.subcontractor_id`, '');
    } else if (value === 'subcontractor') {
      form.setValue(`items.${index}.vendor_id`, '');
    } else {
      form.setValue(`items.${index}.vendor_id`, '');
      form.setValue(`items.${index}.subcontractor_id`, '');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-start p-3 border rounded-md">
      <ItemDescription control={form.control} index={index} />

      <div className="col-span-12 md:col-span-3">
        <ItemTypeSelector 
          control={form.control} 
          index={index} 
          onTypeChange={handleTypeChange}
        />
      </div>

      {/* Show vendor selector if type is vendor */}
      {itemType === 'vendor' && (
        <div className="col-span-12 md:col-span-3">
          <VendorSelector 
            control={form.control} 
            index={index} 
            vendors={vendors}
            loading={loading}
          />
        </div>
      )}

      {/* Show subcontractor selector if type is subcontractor */}
      {itemType === 'subcontractor' && (
        <div className="col-span-12 md:col-span-3">
          <SubcontractorSelector 
            control={form.control} 
            index={index} 
            subcontractors={subcontractors}
            loading={loading}
          />
        </div>
      )}

      <CostFields control={form.control} index={index} />
      
      <ItemCalculations 
        itemPrice={itemPrice}
        grossMargin={grossMargin}
        grossMarginPercentage={grossMarginPercentage}
      />

      <div className="col-span-12 flex justify-end">
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash className="h-4 w-4 mr-1" />
            Remove Item
          </Button>
        )}
      </div>
    </div>
  );
};

export default EstimateItemRow;
