
import React, { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

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
  const [isOpen, setIsOpen] = useState(false);
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

  const description = useWatch({
    control: form.control,
    name: `items.${index}.description`,
    defaultValue: ''
  });

  // Calculate derived values for display
  const item = { cost, markup_percentage: markupPercentage, quantity };
  const itemPrice = calculateItemPrice(item);
  const grossMargin = calculateItemGrossMargin(item);
  const grossMarginPercentage = calculateItemGrossMarginPercentage(item);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border rounded-md overflow-hidden transition-all"
    >
      {/* Always visible summary row */}
      <div className="p-3 bg-white flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <div className="flex-1 font-medium truncate">
          {description || 'Untitled Item'}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">${itemPrice.toFixed(2)}</span>
            {quantity !== '1' && <span> × {quantity}</span>}
          </div>
          
          <div className="text-sm text-muted-foreground hidden md:block">
            GM: {grossMarginPercentage.toFixed(1)}%
          </div>
          
          {showRemoveButton && (
            <RemoveItemButton onRemove={onRemove} showButton={true} />
          )}
        </div>
      </div>
      
      {/* Collapsible detailed content */}
      <CollapsibleContent>
        <div className="border-t p-3 bg-gray-50">
          <div className="grid grid-cols-12 gap-2 items-start">
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
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default EstimateItemCard;
