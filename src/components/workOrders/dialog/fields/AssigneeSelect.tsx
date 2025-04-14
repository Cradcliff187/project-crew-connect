import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

interface AssigneeSelectProps {
  form: UseFormReturn<WorkOrderFormValues>;
  employees: { employee_id: string; first_name: string; last_name: string }[];
}

const AssigneeSelect = ({ form, employees }: AssigneeSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="assigned_to"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assign To</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white z-[1000]" sideOffset={4}>
              {employees && employees.length > 0 ? (
                employees.map(employee => (
                  <SelectItem
                    key={employee.employee_id}
                    value={employee.employee_id}
                    className="cursor-pointer hover:bg-gray-100 py-2 px-4"
                  >
                    {`${employee.first_name} ${employee.last_name}`}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-employees" disabled className="text-gray-500">
                  No employees available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AssigneeSelect;
