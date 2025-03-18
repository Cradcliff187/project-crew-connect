
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
          name="on_time_percentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>On-Time Completion (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g. 95" 
                  min="0"
                  max="100"
                  value={field.value === null ? '' : field.value}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Percentage of jobs completed on schedule
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="quality_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quality Score (0-100)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g. 85" 
                  min="0"
                  max="100"
                  value={field.value === null ? '' : field.value}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Average quality score across all work
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="response_time_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avg. Response Time (hours)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g. 4" 
                  min="0"
                  step="0.5"
                  value={field.value === null ? '' : field.value}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Average time to respond to inquiries
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="safety_incidents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Safety Incidents</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g. 0" 
                  min="0"
                  value={field.value === null ? '' : field.value}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormDescription>
                Number of safety incidents in the past year
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
