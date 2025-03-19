
import React from 'react';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { FormSectionProps } from '../types/formTypes';

const PerformanceMetricsSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium text-lg mb-4 text-[#0485ea]">Performance Metrics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating (1-5)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g. 4" 
                  min="1"
                  max="5"
                  step="0.5"
                  value={field.value === null ? '' : field.value}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Overall performance rating
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default PerformanceMetricsSection;
