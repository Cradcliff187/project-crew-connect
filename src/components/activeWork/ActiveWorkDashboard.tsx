import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { CalendarClock, Clock, ChevronRight, Briefcase, Wrench } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { mapStatusToStatusBadge } from '@/components/projects/ProjectsTable';
import { WorkOrder } from '@/types/workOrder';
import WorkOrderDetailDialog from '@/components/workOrders/WorkOrderDetailDialog';

interface Project {
  projectid: string;
  projectname: string;
  customername: string;
  status: string;
  createdon: string;
  budget?: number;
  spent?: number;
  progress?: number;
}

interface ActiveWorkDashboardProps {
  projects: Project[];
  workOrders: WorkOrder[];
  projectsLoading: boolean;
  workOrdersLoading: boolean;
  searchQuery: string;
  onWorkOrderChange: () => void;
}

const ActiveWorkDashboard = ({
  projects,
  workOrders,
  projectsLoading,
  workOrdersLoading,
  searchQuery,
  onWorkOrderChange
}: ActiveWorkDashboardProps) => {
  const navigate = useNavigate();
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    (project.projectname?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (project.customername?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (project.projectid?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );
  
  // Filter work orders based on search query
  const filteredWorkOrders = workOrders.filter(workOrder => {
    const searchLower = searchQuery.toLowerCase();
    return (
      workOrder.title.toLowerCase().includes(searchLower) ||
      (workOrder.description?.toLowerCase() || '').includes(searchLower) ||
      (workOrder.po_number?.toLowerCase() || '').includes(searchLower) ||
      workOrder.status.toLowerCase().includes(searchLower)
    );
  });
  
  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };
  
  const handleViewWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setDetailOpen(true);
  };
  
  return (
    <div className="space-y-8 py-4">
      {(projects.length > 0 || projectsLoading) && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Projects
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
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
              ))
            ) : filteredProjects.length === 0 ? (
              <Card className="col-span-full py-8">
                <div className="text-center text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No projects found matching your search criteria</p>
                </div>
              </Card>
            ) : (
              filteredProjects.map((project) => (
                <Card key={project.projectid} className="overflow-hidden">
                  <div className="h-2 bg-[#0485ea]"></div>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-[#0485ea] mb-1">{project.projectname}</h4>
                    <p className="text-sm text-muted-foreground mb-4">Client: {project.customername || 'No Client'}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Budget</div>
                        <div className="font-medium">
                          {formatCurrency(project.spent || 0)} <span className="text-muted-foreground">of {formatCurrency(project.budget || 0)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Progress</div>
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress || 0} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{project.progress || 0}%</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <StatusBadge status={mapStatusToStatusBadge(project.status)} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-4 bg-muted/50">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between"
                      onClick={() => handleViewProject(project.projectid)}
                    >
                      View Project
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
      
      {(workOrders.length > 0 || workOrdersLoading) && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Work Orders
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workOrdersLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
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
              ))
            ) : filteredWorkOrders.length === 0 ? (
              <Card className="col-span-full py-8">
                <div className="text-center text-muted-foreground">
                  <Wrench className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No work orders found matching your search criteria</p>
                </div>
              </Card>
            ) : (
              filteredWorkOrders.map((workOrder) => (
                <Card key={workOrder.work_order_id} className="overflow-hidden">
                  <div className="h-2 bg-[#0485ea]"></div>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-[#0485ea] mb-1">{workOrder.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {workOrder.po_number ? `PO #${workOrder.po_number}` : 'No PO Number'}
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Scheduled
                          </div>
                        </div>
                        <div className="font-medium">
                          {workOrder.scheduled_date ? formatDate(workOrder.scheduled_date) : 'Not scheduled'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Progress</div>
                        <div className="flex items-center gap-2">
                          <Progress value={workOrder.progress || 0} className="h-2 flex-1" />
                          <span className="text-sm font-medium">{workOrder.progress || 0}%</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex items-center justify-between">
                        <StatusBadge status={workOrder.status} />
                        <span className="text-sm font-medium capitalize">
                          {workOrder.priority?.toLowerCase() || 'Medium'} Priority
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-4 bg-muted/50">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between"
                      onClick={() => handleViewWorkOrder(workOrder)}
                    >
                      View Work Order
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
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
