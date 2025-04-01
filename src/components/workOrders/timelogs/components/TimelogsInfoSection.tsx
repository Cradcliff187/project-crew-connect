
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timelogColumns } from '../data/columns';
import { DataTable } from '@/components/ui/data-table';
import { format } from 'date-fns';
import { TimelogAddHeader } from './header';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TimelogEntry {
  id: string;
  date_worked: string;
  hours_worked: number;
  employee_id?: string | null;
  notes?: string | null;
  created_at: string;
}

interface TimelogsInfoSectionProps {
  timelogs: TimelogEntry[];
  loading: boolean;
  employees: { employee_id: string; name: string }[];
  workOrderId: string;
  onDelete: (id: string) => void;
  onTimeLogAdded: () => void;
}

export const TimelogsInfoSection = ({
  timelogs,
  loading,
  employees,
  workOrderId,
  onDelete,
  onTimeLogAdded
}: TimelogsInfoSectionProps) => {
  // Total hours spent on this work order
  const totalHours = timelogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);
  
  // Find employee name by ID
  const getEmployeeName = (employeeId: string | null | undefined) => {
    if (!employeeId) return "Unassigned";
    const employee = employees.find(e => e.employee_id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };
  
  // Format data for the table
  const formattedTimelogs = timelogs.map(log => ({
    id: log.id,
    date: log.date_worked ? format(new Date(log.date_worked), 'MMM dd, yyyy') : 'N/A',
    hours: log.hours_worked?.toFixed(2) || '0',
    employee: getEmployeeName(log.employee_id),
    notes: log.notes || '',
    date_raw: log.date_worked || '', // For sorting
  }));
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <TimelogAddHeader 
        workOrderId={workOrderId} 
        employees={employees}
        onTimeLogAdded={onTimeLogAdded}
      />
      
      <CardContent>
        {timelogs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No time entries recorded yet.</p>
            <p className="text-sm mt-2">Log time using the button above.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Total Hours: <span className="font-medium text-foreground">{totalHours.toFixed(2)}</span>
              </p>
            </div>
            
            <DataTable
              columns={timelogColumns(onDelete)}
              data={formattedTimelogs}
              filterColumn="employee"
              defaultSorting={{
                columnId: 'date_raw',
                direction: 'desc'
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
