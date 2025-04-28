import React, { useState } from 'react';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Employee, getEmployeeFullName } from '@/types/common';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EmployeesPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

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
    <PageTransition>
      <Helmet>
        <title>Employees | AKC LLC</title>
      </Helmet>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <h1 className="text-2xl font-bold mb-6 text-[#0485ea]">Employee Management</h1>
        <EmployeeList
          onAddEmployee={handleAddEmployee}
          onEditEmployee={handleEditEmployee}
          onDeleteEmployee={startDeleteEmployee}
        />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
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
                TERMINATED. They will no longer appear in active lists. This action cannot be undone
                easily.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEmployeeToDelete(null)} disabled={isDeleting}>
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
  );
};

export default EmployeesPage;
