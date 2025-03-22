
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import ItemDescription from './ItemDescription';
import ItemTypeSelector from './ItemTypeSelector';
import VendorSelector from './VendorSelector';
import SubcontractorSelector from './SubcontractorSelector';
import CostInput from './CostInput';
import MarkupInput from './MarkupInput';
import PriceDisplay from './PriceDisplay';
import MarginDisplay from './MarginDisplay';
import RemoveItemButton from './RemoveItemButton';
import { 
  calculateItemPrice, 
  calculateItemGrossMargin, 
  calculateItemGrossMarginPercentage 
} from '../../utils/estimateCalculations';

interface EstimateItemCardProps {
  index: number;
  vendors: { vendorid: string; vendorname: string }[];
  subcontractors: { subid: string; subname: string }[];
  loading: boolean;
  onRemove: () => void;
  showRemoveButton: boolean;
}

const EstimateItemCard: React.FC<EstimateItemCardProps> = ({ 
  index, 
  vendors, 
  subcontractors, 
  loading, 
  onRemove,
  showRemoveButton 
}) => {
  const form = useFormContext<EstimateFormValues>();
  
  // Get current values for calculations
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

  return (
    <div className="grid grid-cols-12 gap-2 items-start p-3 border rounded-md">
      <ItemDescription index={index} />
      <ItemTypeSelector index={index} />
      
      {/* Show vendor selector if type is vendor */}
      {itemType === 'vendor' && (
        <VendorSelector index={index} vendors={vendors} loading={loading} />
      )}

      {/* Show subcontractor selector if type is subcontractor */}
      {itemType === 'subcontractor' && (
        <SubcontractorSelector index={index} subcontractors={subcontractors} loading={loading} />
      )}

      <CostInput index={index} />
      <MarkupInput index={index} />
      <PriceDisplay price={itemPrice} />
      <MarginDisplay grossMargin={grossMargin} grossMarginPercentage={grossMarginPercentage} />
      
      <RemoveItemButton onRemove={onRemove} showButton={showRemoveButton} />
    </div>
  );
};

export default EstimateItemCard;
