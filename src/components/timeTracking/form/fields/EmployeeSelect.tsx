
import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { TimeFormEmployee } from '@/types/timeTracking';

interface EmployeeSelectProps {
  employeeId: string;
  employees: TimeFormEmployee[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  setSelectedEmployeeRate: (rate: number | null) => void;
  selectedEmployeeRate: number | null;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  employeeId,
  employees,
  onChange,
  setSelectedEmployeeRate,
  selectedEmployeeRate
}) => {
  // Safely update employee rate when employeeId changes
  useEffect(() => {
    if (employeeId && employees.length > 0) {
      const employee = employees.find(emp => emp.employee_id === employeeId);
      if (employee?.hourly_rate !== selectedEmployeeRate) {
        setSelectedEmployeeRate(employee?.hourly_rate || null);
      }
    } else if (selectedEmployeeRate !== null) {
      setSelectedEmployeeRate(null);
    }
  }, [employeeId, employees, selectedEmployeeRate, setSelectedEmployeeRate]);

  return (
    <div className="space-y-2">
      <Label htmlFor="employee">Employee</Label>
      <select
        id="employee"
        className="w-full border border-gray-300 rounded-md p-2"
        value={employeeId || ''}
        onChange={onChange}
      >
        {employees.map(employee => (
          <option key={employee.employee_id} value={employee.employee_id}>
            {employee.name} {employee.hourly_rate ? `- $${employee.hourly_rate}/hr` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EmployeeSelect;
