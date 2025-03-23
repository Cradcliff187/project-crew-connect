
import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoreHorizontal, FileClock, Building, Receipt, Trash } from 'lucide-react';
import { TimeEntry } from '@/types/timeTracking';
import { formatDate, formatCurrency } from '@/lib/utils';
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
  onViewReceipts
}) => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showReceiptsDialog, setShowReceiptsDialog] = useState(false);
  
  const formatEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'work_order':
        return <FileClock className="h-4 w-4 text-[#0485ea]" />;
      case 'project':
        return <Building className="h-4 w-4 text-green-500" />;
      default:
        return <FileClock className="h-4 w-4 text-gray-500" />;
    }
  };
  
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
        <p className="text-sm text-muted-foreground">Use the Log Time button to track your work hours.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-[#0485ea]/10">
            <TableRow>
              <TableHead className="font-montserrat font-semibold text-[#0485ea]">Date</TableHead>
              <TableHead className="font-montserrat font-semibold text-[#0485ea]">Type</TableHead>
              <TableHead className="font-montserrat font-semibold text-[#0485ea]">Name</TableHead>
              <TableHead className="font-montserrat font-semibold text-[#0485ea]">Hours</TableHead>
              <TableHead className="font-montserrat font-semibold text-[#0485ea]">Employee</TableHead>
              <TableHead className="font-montserrat font-semibold text-[#0485ea] text-right">Cost</TableHead>
              <TableHead className="font-montserrat font-semibold text-[#0485ea] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-[#0485ea]/5 transition-colors">
                <TableCell>{formatDate(entry.date_worked)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {formatEntityTypeIcon(entry.entity_type)}
                    <span className="ml-2 capitalize">
                      {entry.entity_type.replace('_', ' ')}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {entry.entity_name || entry.entity_id.substring(0, 8)}
                  {entry.entity_location && (
                    <span className="text-xs text-muted-foreground block">
                      {entry.entity_location}
                    </span>
                  )}
                </TableCell>
                <TableCell>{entry.hours_worked.toFixed(2)}</TableCell>
                <TableCell>{entry.employee_name || 'Unassigned'}</TableCell>
                <TableCell className="text-right">
                  {entry.cost ? formatCurrency(entry.cost) : 
                    (entry.hours_worked && entry.employee_rate ? 
                      formatCurrency(entry.hours_worked * entry.employee_rate) : 
                      formatCurrency(entry.hours_worked * 75))}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center space-x-2">
                    {entry.has_receipts && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewReceipts(entry.id)}
                      >
                        <Receipt className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(entry.id)}>
                          View {entry.entity_type === 'work_order' ? 'Work Order' : 'Project'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewReceipts(entry.id)}>
                          {entry.has_receipts ? 'View Receipts' : 'Add Receipt'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
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
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Receipts Dialog */}
      <Dialog open={showReceiptsDialog} onOpenChange={setShowReceiptsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Time Entry Receipts</DialogTitle>
          </DialogHeader>
          <TimeEntryReceipts 
            timeEntryId={selectedEntryId || undefined} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeTrackingTable;
