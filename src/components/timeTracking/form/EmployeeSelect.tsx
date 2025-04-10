
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/types/timeTracking';

export interface EmployeeSelectProps {
  control?: Control<any>;
  employees: Employee[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  control,
  employees,
  value,
  onChange,
  label = "Employee (Optional)"
}) => {
  // If we're using react-hook-form control
  if (control) {
    return (
      <FormField
        control={control}
        name="employeeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || ''}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">-- None --</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.employee_id} value={employee.employee_id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    );
  }
  
  // If we're using controlled component approach
  return (
    <div className="space-y-2">
      <FormLabel htmlFor="employeeSelect">{label}</FormLabel>
      <Select
        value={value || ''}
        onValueChange={onChange || (() => {})}
      >
        <SelectTrigger id="employeeSelect">
          <SelectValue placeholder="Select employee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">-- None --</SelectItem>
          {employees.map((employee) => (
            <SelectItem key={employee.employee_id} value={employee.employee_id}>
              {employee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EmployeeSelect;
