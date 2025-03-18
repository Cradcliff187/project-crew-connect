
import React from 'react';
import { ArrowUp, ArrowDown, Calendar, Clock, Trash2, Eye, MoreHorizontal, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatCurrency } from '@/lib/utils';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TimeEntry {
  id: string;
  entityType: 'work_order' | 'project';
  entityId: string;
  entityName: string;
  entityLocation?: string;
  dateWorked: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  notes?: string;
  employee?: {
    id: string;
    name: string;
    hourlyRate?: number;
  };
  cost?: number;
  hasReceipts?: boolean;
}

interface TimeTrackingTableProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

const TimeTrackingTable: React.FC<TimeTrackingTableProps> = ({ 
  entries,
  onDelete,
  onView
}) => {
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof TimeEntry;
    direction: 'ascending' | 'descending';
  }>({
    key: 'dateWorked',
    direction: 'descending',
  });
  
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [entryToDelete, setEntryToDelete] = React.useState<string | null>(null);

  // Apply sorting
  const sortedEntries = React.useMemo(() => {
    const sortableEntries = [...entries];
    
    sortableEntries.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    return sortableEntries;
  }, [entries, sortConfig]);

  const handleSort = (key: keyof TimeEntry) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    });
  };

  const confirmDelete = (id: string) => {
    setEntryToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirmed = () => {
    if (entryToDelete) {
      onDelete(entryToDelete);
      setShowDeleteDialog(false);
      setEntryToDelete(null);
    }
  };

  const getSortIcon = (key: keyof TimeEntry) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'ascending' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const getTimeEntryActions = (entry: TimeEntry): ActionGroup[] => {
    return [
      {
        items: [
          {
            label: 'View details',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => onView(entry.id),
          },
          {
            label: 'View receipt(s)',
            icon: <FileText className="h-4 w-4" />,
            onClick: () => console.log('View receipts for', entry.id),
            disabled: !entry.hasReceipts,
          },
        ],
      },
      {
        items: [
          {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => confirmDelete(entry.id),
            className: 'text-red-600',
          },
        ],
      },
    ];
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('dateWorked')}
              >
                <div className="flex items-center">
                  Date {getSortIcon('dateWorked')}
                </div>
              </TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Time</TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('hoursWorked')}
              >
                <div className="flex items-center">
                  Hours {getSortIcon('hoursWorked')}
                </div>
              </TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEntries.length > 0 ? (
              sortedEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>{formatDate(entry.dateWorked)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="cursor-help">
                          <div className="font-medium">{entry.entityName}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {entry.entityType.replace('_', ' ')}
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">{entry.entityName}</h4>
                          {entry.entityLocation && (
                            <div className="text-sm text-muted-foreground">
                              Location: {entry.entityLocation}
                            </div>
                          )}
                          {entry.employee && (
                            <div className="text-sm">
                              Employee: {entry.employee.name}
                              {entry.employee.hourlyRate && (
                                <span className="text-muted-foreground ml-1">
                                  (${entry.employee.hourlyRate}/hr)
                                </span>
                              )}
                            </div>
                          )}
                          {entry.cost !== undefined && (
                            <div className="font-medium">
                              Cost: {formatCurrency(entry.cost)}
                            </div>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>{entry.startTime} - {entry.endTime}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{entry.hoursWorked}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {entry.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionMenu 
                      groups={getTimeEntryActions(entry)} 
                      size="sm" 
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No time entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this time entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeTrackingTable;
