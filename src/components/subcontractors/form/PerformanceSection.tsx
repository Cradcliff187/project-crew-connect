
import React from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSectionProps } from '../types/formTypes';

const PerformanceSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium text-lg mb-4 text-[#0485ea]">Performance & Evaluation</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="preferred"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Preferred Vendor</FormLabel>
                <FormDescription>
                  Mark as a preferred subcontractor
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default PerformanceSection;
