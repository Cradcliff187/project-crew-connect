import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoreHorizontal, FileClock, Receipt, Trash } from 'lucide-react';
import { TimeEntry } from '@/types/timeTracking';
import { formatDate, formatCurrency, formatHours } from '@/lib/utils';
import TimeEntryReceipts from './TimeEntryReceipts';

interface TimeTrackingTableProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onViewReceipts: (id: string) => void;
}

const TimeTrackingTable: React.FC<TimeTrackingTableProps> = ({
  entries,
  onDelete,
  onView,
  onViewReceipts,
}) => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showReceiptsDialog, setShowReceiptsDialog] = useState(false);

  const handleViewReceipts = (id: string) => {
    setSelectedEntryId(id);
    setShowReceiptsDialog(true);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md bg-muted/20">
        <div className="rounded-full bg-muted p-3 mx-auto w-fit mb-3">
          <FileClock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No time entries found</h3>
        <p className="text-sm text-muted-foreground">
          Use the Log Time button to track your work hours.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-[#0485ea]/10">
            <TableRow>
              <TableHead className="w-[120px] font-montserrat font-semibold text-[#0485ea]">
                Date
              </TableHead>
              <TableHead className="font-montserrat font-semibold text-[#0485ea]">
                Employee
              </TableHead>
              <TableHead className="font-montserrat font-semibold text-[#0485ea]">
                Work Item
              </TableHead>
              <TableHead className="w-[100px] font-montserrat font-semibold text-[#0485ea] text-right">
                Hours
              </TableHead>
              <TableHead className="w-[100px] font-montserrat font-semibold text-[#0485ea] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(entry => {
              console.log(
                `[TimeTrackingTable] Rendering entry: ${entry.id}, employee_name:`,
                entry.employee_name
              );

              return (
                <TableRow key={entry.id} className="hover:bg-[#0485ea]/5 transition-colors">
                  <TableCell>{formatDate(entry.date_worked)}</TableCell>
                  <TableCell>{entry.employee_name || 'Unassigned'}</TableCell>
                  <TableCell className="font-medium">
                    {entry.entity_name || entry.entity_id}
                  </TableCell>
                  <TableCell className="text-right">{formatHours(entry.hours_worked)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center space-x-1">
                      {entry.has_receipts && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewReceipts(entry.id)}
                          title="View Receipts"
                          className="h-8 w-8"
                        >
                          <Receipt className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(entry.id)}>
                            View {entry.entity_type === 'work_order' ? 'Work Order' : 'Project'}{' '}
                            Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewReceipts(entry.id)}>
                            {entry.has_receipts ? 'View Receipts' : 'Add Receipt'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-700"
                            onClick={() => onDelete(entry.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Entry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showReceiptsDialog} onOpenChange={setShowReceiptsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Time Entry Receipts</DialogTitle>
          </DialogHeader>
          <TimeEntryReceipts timeEntryId={selectedEntryId || undefined} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeTrackingTable;
