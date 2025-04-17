
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/dates';
import { Employee } from '@/types/common';
import { getEmployeeFullName } from '@/utils/employeeAdapter';
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table';
import StatusBadge from '@/components/common/status/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeEntry {
  id: string;
  date_worked: string;
  employee_id: string;
  start_time: string;
  end_time: string;
  hours_worked: number;
  notes: string;
  has_receipts: boolean;
}

interface ProjectTimelogsListProps {
  projectId: string;
  employees: Employee[];
}

const ProjectTimelogsList: React.FC<ProjectTimelogsListProps> = ({ projectId, employees }) => {
  const { data: timelogs, isLoading, error } = useQuery({
    queryKey: ['project-timelogs', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('entity_type', 'project')
        .eq('entity_id', projectId)
        .order('date_worked', { ascending: false });

      if (error) throw error;
      return data as TimeEntry[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading time entries: {error.message || 'Unknown error'}
      </div>
    );
  }

  if (!timelogs || timelogs.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No time entries found for this project.
      </div>
    );
  }

  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(e => e.id === employeeId || e.employee_id === employeeId);
    return employee ? getEmployeeFullName(employee) : 'Unknown Employee';
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timelogs.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{formatDate(entry.date_worked)}</TableCell>
                <TableCell>{getEmployeeName(entry.employee_id)}</TableCell>
                <TableCell>{entry.hours_worked}</TableCell>
                <TableCell>
                  {entry.start_time} - {entry.end_time}
                </TableCell>
                <TableCell>
                  {entry.has_receipts ? (
                    <StatusBadge status="success" label="Yes" color="green" size="sm" />
                  ) : (
                    <StatusBadge status="neutral" label="No" color="neutral" size="sm" />
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{entry.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProjectTimelogsList;
