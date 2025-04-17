
import { Employee } from '@/types/common';

/**
 * Helper function to get a full name from an employee
 */
export function getEmployeeFullName(employee: Employee): string {
  if (employee.name) return employee.name;
  return `${employee.firstName} ${employee.lastName}`.trim();
}
