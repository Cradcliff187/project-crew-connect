
import { Employee } from '@/types/common';

export function adaptEmployeesFromDatabase(dbEmployees: any[]): Employee[] {
  return dbEmployees.map(dbEmployee => ({
    id: dbEmployee.employee_id,
    employee_id: dbEmployee.employee_id, // Keep for backward compatibility
    firstName: dbEmployee.first_name,
    lastName: dbEmployee.last_name,
    name: `${dbEmployee.first_name} ${dbEmployee.last_name}`,
    email: dbEmployee.email,
    role: dbEmployee.role,
    hourlyRate: dbEmployee.hourly_rate,
    status: dbEmployee.status,
  }));
}

// Helper functions for employee data handling
export function getEmployeeById(employees: Employee[], id?: string): Employee | undefined {
  if (!id) return undefined;
  return employees.find(emp => emp.id === id || emp.employee_id === id);
}

export function getEmployeeFullName(employee: Employee | null | undefined): string {
  if (!employee) return '';
  
  if (employee.name) return employee.name;
  
  return `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
}
