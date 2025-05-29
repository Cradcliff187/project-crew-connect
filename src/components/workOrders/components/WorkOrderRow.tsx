import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { formatDate, calculateDaysUntilDue } from '@/lib/utils';
import { Pencil, MessageSquare, CalendarClock, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import StatusBadge from '@/components/common/status/StatusBadge';
import DueStatusBadge from './DueStatusBadge';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import PriorityBadge from '@/components/common/status/PriorityBadge';
import UnifiedSchedulingDialog from '@/components/scheduling/UnifiedSchedulingDialog';
import {
  EnhancedCalendarService,
  EnhancedCalendarEventData,
} from '@/services/enhancedCalendarService';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface WorkOrderRowProps {
  workOrder: WorkOrder;
}

const WorkOrderRow: React.FC<WorkOrderRowProps> = ({ workOrder }) => {
  const navigate = useNavigate();
  const daysUntilDue = calculateDaysUntilDue(workOrder.due_by_date);

  // State for dialogs
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);
  const [messageText, setMessageText] = useState('');

  const handleViewDetails = () => {
    navigate(`/work-orders/${workOrder.work_order_id}`);
  };

  const handleScheduleWorkOrder = () => {
    setShowScheduleDialog(true);
  };

  const handleScheduleSave = async (eventData: EnhancedCalendarEventData): Promise<boolean> => {
    try {
      const result = await EnhancedCalendarService.createEvent(eventData);

      if (result.success) {
        toast({
          title: 'Work Order Scheduled Successfully! 📅',
          description: `${workOrder.title || 'Work order'} has been added to your calendar.`,
        });
        return true;
      } else {
        throw new Error(result.errors?.[0] || 'Failed to schedule work order');
      }
    } catch (error) {
      console.error('Error scheduling work order:', error);
      toast({
        title: 'Scheduling Error',
        description: error instanceof Error ? error.message : 'Failed to schedule work order',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleMessagesClick = () => {
    setShowMessagesDialog(true);
    setMessageText('');
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message before sending.',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Implement actual messaging functionality
    // For now, we'll simulate sending a message
    toast({
      title: 'Message Sent Successfully! 💬',
      description: `Your message about ${workOrder.title || 'this work order'} has been sent.`,
    });

    setShowMessagesDialog(false);
    setMessageText('');
  };

  const actionGroups: ActionGroup[] = [
    {
      items: [
        {
          label: 'View Details',
          icon: <Eye className="h-4 w-4" />,
          onClick: handleViewDetails,
          className: 'text-[#0485ea] hover:text-[#0375d1] font-opensans',
        },
        {
          label: 'Edit',
          icon: <Pencil className="h-4 w-4" />,
          onClick: handleViewDetails,
          className: 'text-gray-600 hover:text-gray-800 font-opensans',
        },
      ],
    },
    {
      items: [
        {
          label: 'Schedule',
          icon: <CalendarClock className="h-4 w-4" />,
          onClick: handleScheduleWorkOrder,
          className: 'text-gray-600 hover:text-gray-800 font-opensans',
        },
        {
          label: 'Messages',
          icon: <MessageSquare className="h-4 w-4" />,
          onClick: handleMessagesClick,
          className: 'text-gray-600 hover:text-gray-800 font-opensans',
        },
      ],
    },
  ];

  return (
    <>
      <TableRow
        key={workOrder.work_order_id}
        className="hover:bg-[#0485ea]/5 transition-colors cursor-pointer"
        onClick={handleViewDetails}
      >
        <TableCell className="font-medium font-opensans">
          <Link
            to={`/work-orders/${workOrder.work_order_id}`}
            className="text-[#0485ea] hover:underline font-opensans"
            onClick={e => e.stopPropagation()}
          >
            {workOrder.work_order_number || '-'}
          </Link>
        </TableCell>
        <TableCell className="font-opensans">
          {workOrder.po_number ? (
            <span className="text-gray-700">{workOrder.po_number}</span>
          ) : (
            <span className="text-gray-400 italic">No PO</span>
          )}
        </TableCell>
        <TableCell className="font-opensans">
          {workOrder.due_by_date ? formatDate(workOrder.due_by_date) : '-'}
        </TableCell>
        <TableCell>
          <DueStatusBadge daysUntilDue={daysUntilDue} />
        </TableCell>
        <TableCell>
          <PriorityBadge priority={workOrder.priority} />
        </TableCell>
        <TableCell>
          <StatusBadge status={workOrder.status} />
        </TableCell>
        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
          <ActionMenu groups={actionGroups} size="sm" align="end" triggerClassName="ml-auto" />
        </TableCell>
      </TableRow>

      {/* Schedule Dialog */}
      <UnifiedSchedulingDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        context={{
          entityType: 'work_order',
          workOrderId: workOrder.work_order_id,
          workOrderNumber: workOrder.work_order_number,
          title: `Schedule: ${workOrder.title || workOrder.work_order_number || 'Work Order'}`,
          description: workOrder.description || 'Work order scheduling',
        }}
        onSave={handleScheduleSave}
        onCancel={() => setShowScheduleDialog(false)}
      />

      {/* Messages Dialog */}
      <Dialog open={showMessagesDialog} onOpenChange={setShowMessagesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-[#0485ea] font-montserrat">
              <MessageSquare className="h-5 w-5 mr-2" />
              Send Message
            </DialogTitle>
            <DialogDescription className="font-opensans">
              Send a message about{' '}
              {workOrder.title || workOrder.work_order_number || 'this work order'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium font-opensans">
                Message
              </Label>
              <Textarea
                id="message"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Enter your message here..."
                rows={4}
                className="font-opensans"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMessagesDialog(false)}
              className="font-opensans"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              className="bg-[#0485ea] hover:bg-[#0375d1] font-opensans"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkOrderRow;
