
import { useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

interface CreateLocationToggleProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const CreateLocationToggle = ({ form }: CreateLocationToggleProps) => {
  return (
    <FormField
      control={form.control}
      name="useCustomAddress"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel>Create new location</FormLabel>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default CreateLocationToggle;
