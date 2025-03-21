
import { useFormContext, useWatch } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { 
  calculateItemPrice, 
  calculateItemGrossMargin, 
  calculateItemGrossMarginPercentage 
} from '../../utils/estimateCalculations';

import ItemRowHeader from './ItemRowHeader';
import ItemVendorSection from './ItemVendorSection';
import CostFields from './CostFields';
import ItemCalculations from './ItemCalculations';
import ItemFooter from './ItemFooter';

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
      <ItemRowHeader 
        index={index} 
        control={form.control} 
        onTypeChange={handleTypeChange} 
      />

      <ItemVendorSection
        index={index}
        control={form.control}
        itemType={itemType}
        vendors={vendors}
        subcontractors={subcontractors}
        loading={loading}
      />

      <CostFields control={form.control} index={index} />
      
      <ItemCalculations 
        itemPrice={itemPrice}
        grossMargin={grossMargin}
        grossMarginPercentage={grossMarginPercentage}
      />

      <ItemFooter onRemove={onRemove} canRemove={canRemove} />
    </div>
  );
};

export default EstimateItemRow;
