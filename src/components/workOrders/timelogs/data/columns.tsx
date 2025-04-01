
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface TimesheetEntry {
  id: string;
  date: string;
  date_raw: string;
  hours: string;
  employee: string;
  notes: string;
}

// Delete confirmation dialog component
const DeleteConfirmDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this time entry? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Action cell with delete button
const ActionCell = ({ 
  row, 
  onDelete 
}: { 
  row: { original: TimesheetEntry }; 
  onDelete: (id: string) => void;
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleDelete = () => {
    onDelete(row.original.id);
    setShowDeleteDialog(false);
  };
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setShowDeleteDialog(true);
        }}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
};

// Define the columns
export const timelogColumns = (
  onDelete: (id: string) => void
): ColumnDef<TimesheetEntry>[] => [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "hours",
    header: "Hours",
  },
  {
    accessorKey: "employee",
    header: "Employee",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.original.notes;
      return notes ? (
        <div className="max-w-[200px] truncate" title={notes}>
          {notes}
        </div>
      ) : null;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell row={row} onDelete={onDelete} />,
  },
];
