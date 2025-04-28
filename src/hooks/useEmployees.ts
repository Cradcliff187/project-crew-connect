import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee, getEmployeeFullName } from '@/types/common';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

// Define the fetch function
const fetchActiveEmployees = async (): Promise<Employee[]> => {
  console.log('Fetching active employees via useQuery...');
  const { data, error } = await supabase
    .from('employees')
    .select('employee_id, first_name, last_name, email, phone, role, status, cost_rate, bill_rate') // Select all needed fields
    .eq('status', 'ACTIVE');

  if (error) {
    console.error('Error fetching employees:', error);
    toast({
      title: 'Error Loading Employees',
      description: error.message || 'Failed to fetch employee list.',
      variant: 'destructive',
    });
    throw error; // Re-throw error for useQuery to handle
  }

  // Map data here IF NEEDED, but prefer mapping in useQuery select option
  // Or ensure the select statement aliases match the Employee type directly
  return (data || []) as unknown as Employee[]; // Adjust mapping/type assertion as needed based on actual select
};

/**
 * Custom hook to fetch and manage the list of active employees using React Query.
 */
export function useEmployees() {
  const {
    data: employees = [], // Default to empty array
    isLoading: isLoadingEmployees, // Use isLoading from useQuery
    error,
  } = useQuery<any[], Error, Employee[]>({
    queryKey: ['employees', 'active'], // Define a query key
    queryFn: fetchActiveEmployees, // Pass the fetch function
    select: data => {
      // Adapt data here (preferred location)
      console.log('Adapting employee data in useQuery select...');
      return (data || []).map(
        emp =>
          ({
            id: emp.employee_id,
            employee_id: emp.employee_id,
            firstName: emp.first_name,
            lastName: emp.last_name,
            name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
            email: emp.email,
            phone: emp.phone,
            role: emp.role,
            status: emp.status,
            cost_rate: emp.cost_rate,
            bill_rate: emp.bill_rate,
            // hourlyRate: emp.hourly_rate, // Map if still needed
          }) as Employee
      );
    },
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
    gcTime: 1000 * 60 * 15, // Keep data in cache for 15 minutes
  });

  // Optional: Log error if needed, useQuery handles errors internally
  // if (error) { console.error("Error from useQuery(employees):", error); }

  return { employees, isLoadingEmployees };
}
