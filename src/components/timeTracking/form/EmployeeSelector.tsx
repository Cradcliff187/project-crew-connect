
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Employee {
  employee_id: string;
  name: string;
}

interface EmployeeSelectorProps {
  employees: Employee[];
  selectedEmployeeId: string;
  onChange: (employeeId: string) => void;
  error?: string;
  compact?: boolean;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  selectedEmployeeId,
  onChange,
  error,
  compact = false
}) => {
  // Compact mode is for mobile views
  if (compact) {
    return (
      <div className="space-y-2">
        <Label htmlFor="employee" className="text-sm font-medium">
          Employee <span className="text-red-500">*</span>
        </Label>
        <select
          id="employee"
          className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 bg-white text-sm`}
          value={selectedEmployeeId}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select Employee</option>
          {employees.map(employee => (
            <option key={employee.employee_id} value={employee.employee_id}>
              {employee.name}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
  
  // Standard shadcn/ui selector for desktop
  return (
    <div className="space-y-2">
      <Label htmlFor="employee-select">
        Employee <span className="text-red-500">*</span>
      </Label>
      <Select
        value={selectedEmployeeId}
        onValueChange={onChange}
      >
        <SelectTrigger 
          id="employee-select"
          className={error ? 'border-red-500' : ''}
        >
          <SelectValue placeholder="Select Employee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Select Employee</SelectItem>
          {employees.map(employee => (
            <SelectItem 
              key={employee.employee_id} 
              value={employee.employee_id}
            >
              {employee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default EmployeeSelector;
