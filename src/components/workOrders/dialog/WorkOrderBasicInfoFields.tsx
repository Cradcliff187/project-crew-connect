
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from './WorkOrderFormSchema';

interface WorkOrderBasicInfoFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const WorkOrderBasicInfoFields = ({ form }: WorkOrderBasicInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold text-gray-700">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Title <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  placeholder="Enter work order title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="work_order_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">
                Work Order Number
              </FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  placeholder="Enter work order number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Description</FormLabel>
            <FormControl>
              <Textarea 
                {...field}
                placeholder="Enter work order description" 
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Priority</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value || 'MEDIUM'}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
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
              <FormLabel className="font-medium">PO Number</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  placeholder="Enter PO number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default WorkOrderBasicInfoFields;
