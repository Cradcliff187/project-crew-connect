import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/common';
import { toast } from '@/hooks/use-toast';

/**
 * Custom hook to fetch and manage the list of active employees.
 * Ensures employee data is fetched only once and consistently mapped.
 */
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      console.log('Fetching active employees via useEmployees hook...');
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name, hourly_rate') // Select necessary fields
          .eq('status', 'ACTIVE'); // Filter for active employees

        if (error) {
          throw error;
        }

        // Map database results to the standardized Employee type
        const formattedEmployees = (data || []).map(
          emp =>
            ({
              id: emp.employee_id,
              firstName: emp.first_name,
              lastName: emp.last_name,
              hourlyRate: emp.hourly_rate,
              // Add other required fields from Employee type if necessary,
              // or ensure they are optional in the type definition.
            }) as Employee // Type assertion helps ensure structure matches
        );

        setEmployees(formattedEmployees);
        console.log(`Fetched ${formattedEmployees.length} active employees.`);
      } catch (error: any) {
        console.error('Error fetching employees in useEmployees:', error);
        toast({
          title: 'Error Loading Employees',
          description: error.message || 'Failed to fetch employee list.',
          variant: 'destructive',
        });
        setEmployees([]); // Reset to empty on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []); // Empty dependency array ensures this runs only once on mount

  return { employees, isLoadingEmployees: isLoading };
}
