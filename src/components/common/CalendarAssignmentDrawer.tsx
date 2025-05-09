import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EventAttendee } from '@/types/unifiedCalendar';

interface CalendarAssignmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'work_order' | 'project';
  entityId: string;
  entityName: string;
  onAssign: (assignment: {
    assigneeId: string;
    assigneeName: string;
    assigneeType: string;
    ratePerHour: number;
    notifyExternal: boolean;
    startDate: Date;
    endDate: Date;
  }) => Promise<boolean>;
  initialAssignment?: {
    assigneeId?: string;
    assigneeName?: string;
    assigneeType?: string;
    ratePerHour?: number;
    notifyExternal?: boolean;
    startDate?: Date;
    endDate?: Date;
  };
}

// Mock data for the assignees - replace with real data in production
const mockAssignees: EventAttendee[] = [
  { id: '1', type: 'employee', name: 'John Smith', email: 'john@example.com', rate: 65 },
  { id: '2', type: 'employee', name: 'Sarah Johnson', email: 'sarah@example.com', rate: 75 },
  {
    id: '3',
    type: 'subcontractor',
    name: 'BuildCo Contractors',
    email: 'info@buildco.com',
    rate: 85,
  },
  {
    id: '4',
    type: 'subcontractor',
    name: 'Elite Painters',
    email: 'jobs@elitepainters.com',
    rate: 55,
  },
  { id: '5', type: 'vendor', name: 'Acme Supplies', email: 'sales@acmesupplies.com', rate: 0 },
];

const CalendarAssignmentDrawer: React.FC<CalendarAssignmentDrawerProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
  onAssign,
  initialAssignment = {},
}) => {
  const { toast } = useToast();
  const [assigneeId, setAssigneeId] = useState<string>(initialAssignment.assigneeId || '');
  const [assigneeName, setAssigneeName] = useState<string>(initialAssignment.assigneeName || '');
  const [assigneeType, setAssigneeType] = useState<string>(initialAssignment.assigneeType || '');
  const [ratePerHour, setRatePerHour] = useState<number>(initialAssignment.ratePerHour || 0);
  const [notifyExternal, setNotifyExternal] = useState<boolean>(
    initialAssignment.notifyExternal || false
  );
  const [startDate, setStartDate] = useState<Date>(initialAssignment.startDate || new Date());
  const [endDate, setEndDate] = useState<Date>(initialAssignment.endDate || new Date());
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAssigneePopoverOpen, setIsAssigneePopoverOpen] = useState(false);

  // Filter assignees based on search query
  const filteredAssignees = mockAssignees.filter(
    assignee =>
      assignee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignee.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAssignee = (assignee: EventAttendee) => {
    setAssigneeId(assignee.id);
    setAssigneeName(assignee.name || '');
    setAssigneeType(assignee.type);
    setRatePerHour(assignee.rate || 0);
    setIsAssigneePopoverOpen(false);
  };

  const handleAssign = async () => {
    if (!assigneeId) {
      toast({
        title: 'Error',
        description: 'Please select an assignee.',
        variant: 'destructive',
      });
      return;
    }

    setIsAssigning(true);
    try {
      const success = await onAssign({
        assigneeId,
        assigneeName,
        assigneeType,
        ratePerHour,
        notifyExternal,
        startDate,
        endDate,
      });

      if (success) {
        toast({
          title: 'Assignment created',
          description: `Successfully assigned ${assigneeName} to this ${entityType}.`,
        });
        onClose();
      } else {
        toast({
          title: 'Assignment failed',
          description: 'There was an error creating the assignment.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Assignment failed',
        description: 'There was an error creating the assignment.',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getAssigneeTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'employee':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Employee</Badge>;
      case 'subcontractor':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">Subcontractor</Badge>
        );
      case 'vendor':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Vendor</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{type}</Badge>;
    }
  };

  // Calculate estimated cost
  const calculateEstimatedCost = () => {
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay));
    return daysDiff * 8 * ratePerHour; // Assuming 8 hours per day
  };

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" /> Assignment Details
          </SheetTitle>
          <SheetDescription>
            Create an assignment for {entityType} <span className="font-medium">{entityName}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Assignee Selector */}
          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Popover open={isAssigneePopoverOpen} onOpenChange={setIsAssigneePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isAssigneePopoverOpen}
                  className="justify-between w-full text-left"
                >
                  {assigneeId ? assigneeName : 'Select assignee...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search assignees..."
                    onValueChange={setSearchQuery}
                    value={searchQuery}
                  />
                  <CommandEmpty>No assignees found.</CommandEmpty>
                  <CommandGroup heading="Assignees">
                    {filteredAssignees.map(assignee => (
                      <CommandItem
                        key={assignee.id}
                        value={assignee.id}
                        onSelect={() => handleSelectAssignee(assignee)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span>{assignee.name}</span>
                          <span className="text-xs text-muted-foreground">{assignee.email}</span>
                        </div>
                        <div>{getAssigneeTypeBadge(assignee.type)}</div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Rate Per Hour */}
          <div className="space-y-2">
            <Label htmlFor="rate">Rate Per Hour</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                $
              </span>
              <Input
                id="rate"
                type="number"
                min="0"
                step="0.01"
                value={ratePerHour}
                onChange={e => setRatePerHour(Number(e.target.value))}
                className="pl-7"
              />
            </div>
            {ratePerHour > 0 && (
              <p className="text-sm text-muted-foreground">
                Estimated cost: {formatCurrency(calculateEstimatedCost())}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(startDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={date => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(endDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={date => date && setEndDate(date)}
                    initialFocus
                    disabled={date => date < startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Notify External Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify">Notify External Assignee</Label>
              <p className="text-sm text-muted-foreground">
                Send calendar invitation to external assignee
              </p>
            </div>
            <Switch id="notify" checked={notifyExternal} onCheckedChange={setNotifyExternal} />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isAssigning}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={isAssigning || !assigneeId}>
              {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CalendarAssignmentDrawer;
