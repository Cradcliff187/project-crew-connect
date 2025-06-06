import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/status/StatusBadge';
import {
  CalendarClock,
  Clock,
  ChevronRight,
  Briefcase,
  Wrench,
  FileText,
  Paperclip,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { WorkItem } from '@/types/activeWork';
import { WorkOrder } from '@/types/workOrder';
import WorkOrderDetailDialog from '@/components/workOrders/WorkOrderDetailDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface ActiveWorkDashboardProps {
  items: WorkItem[];
  projectsLoading: boolean;
  workOrdersLoading: boolean;
  searchQuery: string;
  onWorkOrderChange: () => void;
}

const ActiveWorkDashboard = ({
  items,
  projectsLoading,
  workOrdersLoading,
  searchQuery,
  onWorkOrderChange,
}: ActiveWorkDashboardProps) => {
  const navigate = useNavigate();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Separate projects and work orders
  const projectItems = items.filter(item => item.type === 'project');
  const workOrderItems = items.filter(item => item.type === 'workOrder');

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleViewWorkOrder = (workOrderItem: WorkItem) => {
    // Convert WorkItem to WorkOrder format, ensuring all required fields are present
    const workOrder: WorkOrder = {
      work_order_id: workOrderItem.id,
      title: workOrderItem.title,
      description: workOrderItem.description || null,
      // Assuming WorkItem.status is compatible with WorkOrder status enum
      status: workOrderItem.status as WorkOrder['status'],
      // Assuming WorkItem.priority is compatible, provide default if not
      priority: (workOrderItem.priority as WorkOrder['priority']) || 'MEDIUM',
      customer_id: workOrderItem.customerId || null,
      location_id: workOrderItem.location || null, // Assuming location is the ID
      scheduled_date: workOrderItem.dueDate || null,
      due_by_date: null, // Not available in WorkItem
      completed_date: null, // Not available in WorkItem
      time_estimate: null, // Not available in WorkItem
      actual_hours: 0, // Default value, dialog might need actual data if displayed
      materials_cost: 0, // Default value
      total_cost: 0, // Default value
      expenses_cost: 0, // Default value for optional field
      progress: workOrderItem.progress || 0,
      created_at: workOrderItem.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(), // Provide a default value
      po_number: workOrderItem.poNumber || null,
      work_order_number: null, // Not available in WorkItem
      assigned_to: workOrderItem.assignedTo || null,
      project_id: null, // Not directly available, maybe link later?
    };

    // No need to cast `workOrder as WorkOrder` now
    setSelectedWorkOrder(workOrder);
    setDetailOpen(true);
  };

  const renderProjectCards = () => {
    if (projectsLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Card key={`skeleton-project-${index}`} className="overflow-hidden">
          <div className="h-2 bg-muted-foreground/10"></div>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-6 w-24 rounded-full mb-2" />
          </CardContent>
          <CardFooter className="border-t p-4 bg-muted/50">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ));
    }

    if (projectItems.length === 0) {
      return (
        <Card className="col-span-full py-8">
          <div className="text-center text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No projects found matching your search criteria</p>
          </div>
        </Card>
      );
    }

    return projectItems.map(item => (
      <Card key={item.id} className="overflow-hidden">
        <div className="h-2 bg-primary"></div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-primary">{item.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Client: {item.customerName || 'No Client'}
          </p>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Budget</div>
              <div className="font-medium">
                {formatCurrency(item.spent || 0)}{' '}
                <span className="text-muted-foreground">of {formatCurrency(item.budget || 0)}</span>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Progress</div>
              <div className="flex items-center gap-2">
                <Progress value={item.progress || 0} className="h-2 flex-1" />
                <span className="text-sm font-medium">{item.progress || 0}%</span>
              </div>
            </div>

            <div className="pt-2">
              <StatusBadge status={item.status} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4 bg-muted/50 flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Time Log
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Docs
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => handleViewProject(item.id)}
          >
            View
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    ));
  };

  const renderWorkOrderCards = () => {
    if (workOrdersLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Card key={`skeleton-workorder-${index}`} className="overflow-hidden">
          <div className="h-2 bg-muted-foreground/10"></div>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-6 w-24 rounded-full mb-2" />
          </CardContent>
          <CardFooter className="border-t p-4 bg-muted/50">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ));
    }

    if (workOrderItems.length === 0) {
      return (
        <Card className="col-span-full py-8">
          <div className="text-center text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No work orders found matching your search criteria</p>
          </div>
        </Card>
      );
    }

    return workOrderItems.map(item => (
      <Card key={item.id} className="overflow-hidden">
        <div className="h-2 bg-primary"></div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-primary">{item.title}</h4>
          </div>
          <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <div>ID: {item.id}</div>
            {item.poNumber && <div className="border-l pl-2">PO #{item.poNumber}</div>}
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                <div className="flex items-center">
                  <CalendarClock className="h-3.5 w-3.5 mr-1" />
                  Scheduled
                </div>
              </div>
              <div className="font-medium">
                {item.dueDate ? formatDate(item.dueDate) : 'Not scheduled'}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Progress</div>
              <div className="flex items-center gap-2">
                <Progress value={item.progress || 0} className="h-2 flex-1" />
                <span className="text-sm font-medium">{item.progress || 0}%</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <StatusBadge status={item.status} />
              <span className="text-sm font-medium capitalize">
                {item.priority?.toLowerCase() || 'Medium'} Priority
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4 bg-muted/50 flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Time Log
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Paperclip className="h-3.5 w-3.5 mr-1" />
              Attach
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => handleViewWorkOrder(item)}
          >
            View
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="space-y-8">
      {(projectItems.length > 0 || projectsLoading) && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Projects
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderProjectCards()}
          </div>
        </div>
      )}

      {(workOrderItems.length > 0 || workOrdersLoading) && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Work Orders
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {renderWorkOrderCards()}
          </div>
        </div>
      )}

      {selectedWorkOrder && (
        <WorkOrderDetailDialog
          workOrder={selectedWorkOrder}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onStatusChange={onWorkOrderChange}
        />
      )}
    </div>
  );
};

export default ActiveWorkDashboard;
