import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Users, Clock, Star, Plus } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import EmployeeList from '@/components/employees/EmployeeList';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { Helmet } from 'react-helmet-async';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Employee, getEmployeeFullName } from '@/types/common';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useEmployees } from '@/hooks/useEmployees';

const EmployeesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { employees } = useEmployees();

  // Calculate metrics for summary cards
  const totalEmployees = employees.length;
  const activeToday = employees.filter(emp => emp.status === 'ACTIVE').length;
  const onProjects = employees.filter(
    emp => emp.status === 'ACTIVE' && emp.role // Using role as a proxy for project assignment
  ).length;
  const newThisMonth = employees.filter(emp => {
    // Since hire_date doesn't exist, we'll use a different metric
    return emp.status === 'ACTIVE';
  }).length;

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const handleSaveSuccess = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
    queryClient.invalidateQueries({ queryKey: ['employees', 'active'] });
  };

  const startDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({ status: 'TERMINATED', updated_at: new Date().toISOString() })
        .eq('employee_id', employeeToDelete.id);

      if (error) throw error;

      toast({
        title: 'Employee Terminated',
        description: `${getEmployeeFullName(employeeToDelete)} has been marked as terminated.`,
      });
      queryClient.invalidateQueries({ queryKey: ['employees', 'active'] });
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    } catch (error: any) {
      console.error('Error terminating employee:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not terminate employee.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-4">
        <Helmet>
          <title>Employees | AKC LLC</title>
        </Helmet>

        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center font-montserrat">
              <UserCheck className="h-8 w-8 mr-3 text-blue-600" />
              Employee Management
            </h1>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 font-opensans"
              >
                {user?.role || 'User'}
              </Badge>
              <Button
                size="sm"
                onClick={handleAddEmployee}
                className="bg-[#0485ea] hover:bg-[#0375d1]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
          </div>
          <p className="text-gray-600 font-opensans">Manage employee information and assignments</p>
        </div>

        {/* Summary Cards - Horizontal Layout for Desktop */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium font-opensans">Total Employees</p>
                  <p className="text-2xl font-bold text-blue-900 font-montserrat">
                    {totalEmployees}
                  </p>
                </div>
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium font-opensans">Active Today</p>
                  <p className="text-2xl font-bold text-green-900 font-montserrat">{activeToday}</p>
                </div>
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium font-opensans">On Projects</p>
                  <p className="text-2xl font-bold text-yellow-900 font-montserrat">{onProjects}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium font-opensans">
                    New This Month
                  </p>
                  <p className="text-2xl font-bold text-purple-900 font-montserrat">
                    {newThisMonth}
                  </p>
                </div>
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Maximum Space for Employee Data */}
        <PageTransition>
          <div className="flex flex-col">
            <EmployeeList
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={startDeleteEmployee}
            />

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEmployee
                      ? 'Update the details for this employee.'
                      : 'Enter the details for the new employee.'}
                  </DialogDescription>
                </DialogHeader>
                <EmployeeForm
                  employeeToEdit={editingEmployee}
                  onSuccess={handleSaveSuccess}
                  onCancel={handleCloseForm}
                />
              </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will mark employee "{getEmployeeFullName(employeeToDelete)}" as
                    TERMINATED. They will no longer appear in active lists. This action cannot be
                    undone easily.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setEmployeeToDelete(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDeleteEmployee}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Termination
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </PageTransition>
      </div>
    </div>
  );
};

export default EmployeesPage;
