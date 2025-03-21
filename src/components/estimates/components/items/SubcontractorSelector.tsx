
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

type Subcontractor = { subid: string; subname: string };

interface SubcontractorSelectorProps {
  control: Control<EstimateFormValues>;
  index: number;
  subcontractors: Subcontractor[];
  loading: boolean;
}

const SubcontractorSelector = ({ control, index, subcontractors, loading }: SubcontractorSelectorProps) => {
  return (
    <FormField
      control={control}
      name={`items.${index}.subcontractor_id`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Subcontractor</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading..." : "Select subcontractor"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {subcontractors.map(sub => (
                <SelectItem key={sub.subid} value={sub.subid}>
                  {sub.subname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SubcontractorSelector;
