
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User } from 'lucide-react';

interface EmployeeOption {
  employee_id: string;
  name: string;
  hourly_rate?: number;
}

interface EmployeeSelectorProps {
  employees: EmployeeOption[];
  selectedEmployeeId: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  selectedEmployeeId,
  onChange,
  isLoading = false,
  error,
  label = "Employee",
  required = true
}) => {
  const selectedEmployee = employees.find(e => e.employee_id === selectedEmployeeId);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="employeeId">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {isLoading ? (
        <div className="flex items-center space-x-2 border rounded-md p-2 h-10">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading employees...</span>
        </div>
      ) : (
        <Select
          value={selectedEmployeeId}
          onValueChange={onChange}
        >
          <SelectTrigger id="employeeId">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.length > 0 ? (
              employees.map(employee => (
                <SelectItem key={employee.employee_id} value={employee.employee_id}>
                  {employee.name}
                </SelectItem>
              ))
            ) : (
              <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                No employees found
              </div>
            )}
          </SelectContent>
        </Select>
      )}
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {selectedEmployee && (
        <div className="mt-2 p-3 bg-muted rounded-md">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-[#0485ea]" />
            <span className="font-medium">{selectedEmployee.name}</span>
          </div>
          {selectedEmployee.hourly_rate && (
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              Rate: ${selectedEmployee.hourly_rate.toFixed(2)}/hr
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeSelector;
