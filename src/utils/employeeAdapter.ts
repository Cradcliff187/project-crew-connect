
import { Employee } from '@/types/common';

/**
 * Adapter function to convert database employee objects to the standard Employee type
 */
export function adaptEmployeeFromDatabase(dbEmployee: any): Employee {
  return {
    id: dbEmployee.employee_id,
    firstName: dbEmployee.first_name || '',
    lastName: dbEmployee.last_name || '',
    name: `${dbEmployee.first_name || ''} ${dbEmployee.last_name || ''}`.trim() || dbEmployee.name || '',
    email: dbEmployee.email || '',
    role: dbEmployee.role || '',
    hourlyRate: dbEmployee.hourly_rate || 0,
    status: dbEmployee.status || 'ACTIVE',
    // Add any other required fields
  };
}

/**
 * Adapter function to convert an array of database employee objects
 */
export function adaptEmployeesFromDatabase(dbEmployees: any[]): Employee[] {
  return dbEmployees.map(adaptEmployeeFromDatabase);
}
