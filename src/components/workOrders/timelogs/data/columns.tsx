import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';

type Timelog = {
  id: string;
  date: string;
  date_raw: string; // For sorting
  hours: string;
  employee: string;
  notes?: string;
  total_cost: number;
};

export const timelogColumns = (onDelete: (id: string) => void): ColumnDef<Timelog>[] => [
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'employee',
    header: 'Employee',
  },
  {
    accessorKey: 'hours',
    header: 'Hours',
  },
  {
    accessorKey: 'total_cost',
    header: 'Cost',
    cell: ({ row }) => formatCurrency(row.original.total_cost),
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => {
      const notes = row.getValue('notes') as string;
      return notes && notes.length > 30 ? `${notes.substring(0, 30)}...` : notes || '-';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const timelog = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(timelog.id)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    // Hidden column for sorting
    accessorKey: 'date_raw',
    header: '',
    enableHiding: true,
  },
];
