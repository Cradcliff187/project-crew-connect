
import React from 'react';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { FormSectionProps, paymentTermsOptions } from '../types/formTypes';

const FinancialSection: React.FC<FormSectionProps> = ({ control }) => {
  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium text-lg mb-4 text-[#0485ea]">Financial Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="payment_terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Terms</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value || 'NET30'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentTermsOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="hourly_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Standard Hourly Rate ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  step="0.01" 
                  min="0"
                  value={field.value === null ? '' : field.value}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="tax_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID / EIN</FormLabel>
              <FormControl>
                <Input placeholder="Tax identification number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default FinancialSection;
