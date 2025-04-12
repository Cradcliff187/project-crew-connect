
import React, { memo, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import EstimateItemCard from './estimate-items/EstimateItemCard';
import { useEstimateItemData } from './estimate-items/useEstimateItemData';

const EstimateItemFields = memo(() => {
  const form = useFormContext<EstimateFormValues>();
  const { vendors, subcontractors, loading } = useEstimateItemData();
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
    // Prevent unnecessary re-renders
    shouldUnregister: false,
  });

  // Function to add a new item with default values
  const addNewItem = useCallback(() => {
    append({ 
      description: '', 
      item_type: 'labor', 
      cost: '0', 
      markup_percentage: '20',
      quantity: '1', 
      unit_price: '0', 
      vendor_id: '',
      subcontractor_id: '',
      document_id: '',
      trade_type: '',
      expense_type: undefined,
      custom_type: ''
    });
  }, [append]);

  // Memoize the remove function
  const handleRemoveItem = useCallback((index: number) => {
    remove(index);
  }, [remove]);

  // Memoize vendors and subcontractors
  const memoizedVendors = useMemo(() => vendors, [vendors]);
  const memoizedSubcontractors = useMemo(() => subcontractors, [subcontractors]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Items ({fields.length})
        </h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addNewItem}
          className="bg-[#0485ea] text-white hover:bg-[#0375d1]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No items added yet. Click "Add Item" to begin.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <EstimateItemCard 
              key={field.id}
              index={index}
              vendors={memoizedVendors}
              subcontractors={memoizedSubcontractors}
              loading={loading}
              onRemove={() => handleRemoveItem(index)}
              showRemoveButton={fields.length > 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

EstimateItemFields.displayName = 'EstimateItemFields';

export default EstimateItemFields;
