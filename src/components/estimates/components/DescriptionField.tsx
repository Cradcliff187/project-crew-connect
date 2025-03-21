
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

const DescriptionField = () => {
  const form = useFormContext<EstimateFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem className="mt-4">
          <FormLabel className="text-[#333333] font-medium">Job Description</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Enter detailed job description" 
              className="min-h-[120px] border-gray-300 focus:border-[#0485ea] focus:ring-[#0485ea]" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DescriptionField;
