
import { Button } from '@/components/ui/button';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import { useEstimateItems } from './items/useEstimateItems';
import EstimateItemRow from './items/EstimateItemRow';

const EstimateItemFields = () => {
  const form = useFormContext<EstimateFormValues>();
  const { vendors, subcontractors, loading } = useEstimateItems();
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Function to add a new item with default values
  const addNewItem = () => {
    append({ 
      description: '', 
      item_type: 'labor', 
      cost: '0', 
      markup_percentage: '20',
      quantity: '1', 
      vendor_id: '',
      subcontractor_id: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Items</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addNewItem}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      {fields.map((field, index) => (
        <EstimateItemRow
          key={field.id}
          index={index}
          vendors={vendors}
          subcontractors={subcontractors}
          loading={loading}
          onRemove={() => remove(index)}
          canRemove={fields.length > 1}
        />
      ))}
    </div>
  );
};

export default EstimateItemFields;
