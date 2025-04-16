import { Employee } from '@/types/common';
import { count, create, executeQuery, getById, remove, update } from '@/utils/dbService';
import { standardizeStatusValue } from '@/utils/fieldMapping';

/**
 * Get all employees with optional filtering
 */
export async function getEmployees(filters = {}, options = {}): Promise<Employee[]> {
  try {
    const employees = await executeQuery<Employee>('employees', ['*'], filters, options);

    // Standardize status values in the response
    return employees.map(employee => ({
      ...employee,
      status: employee.status ? standardizeStatusValue(employee.status) : null,
    }));
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

/**
 * Get a single employee by ID
 */
export async function getEmployeeById(id: string): Promise<Employee | null> {
  try {
    const employee = await getById<Employee>('employees', id);

    if (employee) {
      // Standardize status value
      return {
        ...employee,
        status: standardizeStatusValue(employee.status),
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new employee
 */
export async function createEmployee(data: Partial<Employee>): Promise<Employee> {
  try {
    return await create<Employee>('employees', data);
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}

/**
 * Update an existing employee
 */
export async function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
  try {
    return await update<Employee>('employees', id, data);
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error);
    throw error;
  }
}

/**
 * Delete an employee
 */
export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    return await remove('employees', id);
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
    throw error;
  }
}

/**
 * Count employees matching the given filters
 */
export async function countEmployees(filters = {}): Promise<number> {
  try {
    return await count('employees', filters);
  } catch (error) {
    console.error('Error counting employees:', error);
    throw error;
  }
}

/**
 * Get active employees
 */
export async function getActiveEmployees(): Promise<Employee[]> {
  return getEmployees({ status: 'ACTIVE' }, { orderBy: { field: 'firstName', ascending: true } });
}

/**
 * Get inactive employees
 */
export async function getInactiveEmployees(): Promise<Employee[]> {
  return getEmployees({ status: 'INACTIVE' }, { orderBy: { field: 'firstName', ascending: true } });
}
