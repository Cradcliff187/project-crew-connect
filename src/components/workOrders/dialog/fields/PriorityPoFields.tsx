import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';
import { Flag } from 'lucide-react';

interface PriorityPoFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const PriorityPoFields = ({ form }: PriorityPoFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-montserrat font-medium">Priority</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || 'MEDIUM'}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="font-opensans">
                  <div className="flex items-center">
                    <Flag className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select priority" />
                  </div>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="LOW" className="font-opensans">
                  Low
                </SelectItem>
                <SelectItem value="MEDIUM" className="font-opensans">
                  Medium
                </SelectItem>
                <SelectItem value="HIGH" className="font-opensans">
                  High
                </SelectItem>
                <SelectItem value="URGENT" className="font-opensans">
                  Urgent
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="po_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-montserrat font-medium">PO Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter PO number" className="font-opensans" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PriorityPoFields;
