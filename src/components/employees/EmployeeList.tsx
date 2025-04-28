import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEmployees } from '@/hooks/useEmployees';
import { Employee, getEmployeeFullName } from '@/types/common'; // Import Employee type and helper
import { formatCurrency } from '@/lib/utils'; // Import formatting utility

// Define props if needed later (e.g., for edit/delete handlers)
interface EmployeeListProps {
  // Example: Add handlers for opening form
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
}) => {
  const { employees, isLoadingEmployees } = useEmployees(); // Fetch employees

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Employees</CardTitle>
        <Button size="sm" onClick={onAddEmployee}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingEmployees ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
          </div>
        ) : employees.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No employees found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Cost Rate</TableHead>
                <TableHead className="text-right">Bill Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(employee => (
                <TableRow key={employee.id}>
                  <TableCell>{getEmployeeFullName(employee)}</TableCell>
                  <TableCell>{employee.email || '-'}</TableCell>
                  <TableCell>{employee.phone || '-'}</TableCell>
                  <TableCell>{employee.role || '-'}</TableCell>
                  <TableCell>{employee.status || '-'}</TableCell>
                  <TableCell className="text-right">
                    {employee.cost_rate ? formatCurrency(employee.cost_rate) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {employee.bill_rate ? formatCurrency(employee.bill_rate) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEditEmployee(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => onDeleteEmployee(employee)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeList;
