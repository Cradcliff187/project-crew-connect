
import React from 'react';
import { format } from 'date-fns';
import { Eye, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';
import { TimeEntry } from '@/types/timeTracking';
import { formatTimeRange } from '@/lib/utils';
import ReceiptButton from './components/ReceiptButton';

interface TimeTrackingTableProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onViewReceipts: (id: string) => Promise<void>;
}

const TimeTrackingTable: React.FC<TimeTrackingTableProps> = ({
  entries,
  onDelete,
  onView,
  onViewReceipts
}) => {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <FileText className="h-10 w-10 stroke-[1.25px]" />
                    <div className="text-lg font-medium">No time entries</div>
                    <div className="text-sm">Get started by logging your first time entry.</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(new Date(entry.date_worked), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{entry.entity_type.replace('_', ' ')}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{entry.entity_name || 'Unknown'}</div>
                  </TableCell>
                  <TableCell>
                    {entry.employee_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {formatTimeRange(entry.start_time, entry.end_time)}
                  </TableCell>
                  <TableCell>
                    {entry.hours_worked}
                  </TableCell>
                  <TableCell>
                    ${(entry.total_cost || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <ReceiptButton 
                      timeEntry={entry} 
                      onClick={() => onViewReceipts(entry.id)} 
                    />
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onView(entry.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View {entry.entity_type}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <AlertDialog open={deletingId === entry.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => setDeletingId(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
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
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => {
                                onDelete(entry.id);
                                setDeletingId(null);
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TimeTrackingTable;
