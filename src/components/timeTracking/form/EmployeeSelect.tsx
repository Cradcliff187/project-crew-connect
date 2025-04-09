
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Employee {
  employee_id: string;
  name: string;
}

interface EmployeeSelectProps {
  value: string;
  onChange: (value: string) => void;
  employees: Employee[];
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  includeNoneOption?: boolean;
  noneLabel?: string;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  value,
  onChange,
  employees,
  label = "Employee",
  required = false,
  disabled = false,
  className = "",
  placeholder = "Select employee",
  includeNoneOption = true,
  noneLabel = "Not assigned"
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeNoneOption && <SelectItem value="none">{noneLabel}</SelectItem>}
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
