import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employee, getEmployeeFullName } from '@/types/common';

interface EmployeeSelectProps {
  value: string;
  onChange: (value: string) => void;
  employees: Employee[];
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  value,
  onChange,
  employees,
  label = 'Employee',
  required = false,
  disabled = false,
  className = '',
  placeholder = 'Select employee',
}) => {
  // Log the received employees prop
  console.log('[EmployeeSelect] Received employees:', employees);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Not assigned</SelectItem>
        {Array.isArray(employees) &&
          employees.map((employee, index) => {
            // Add more detailed logging inside the map
            const fullName = getEmployeeFullName(employee);
            console.log(
              `[EmployeeSelect] Mapping item ${index}: ID=${employee?.id}, Name=${fullName}`
            );
            return employee && employee.id ? (
              <SelectItem key={employee.id} value={employee.id}>
                {fullName}
              </SelectItem>
            ) : null;
          })}
      </SelectContent>
    </Select>
  );
};

export default EmployeeSelect;
