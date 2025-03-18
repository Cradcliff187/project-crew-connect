
import { StatusType } from './common';
import { WorkOrder } from './workOrder';

export interface WorkItem {
  id: string;
  type: 'project' | 'workOrder';
  title: string;
  description?: string;
  customerId?: string;
  customerName?: string;
  status: StatusType;
  dueDate?: string;
  createdAt?: string;
  location?: string;
  budget?: number;
  spent?: number;
  progress?: number;
  priority?: string;
  assignedTo?: string;
  poNumber?: string;
}

export const projectToWorkItem = (project: any): WorkItem => {
  // First get the status with a default
  const rawStatus = project.status?.toLowerCase() || '';
  // Then map it to a valid StatusType
  let status: StatusType;
  
  switch (rawStatus) {
    case 'active':
    case 'completed':
    case 'pending':
    case 'cancelled':
    case 'on-hold':
      status = rawStatus as StatusType;
      break;
    default:
      status = 'not_set';
  }
    
  return {
    id: project.projectid,
    type: 'project',
    title: project.projectname || 'Unnamed Project',
    description: project.jobdescription,
    customerId: project.customerid,
    customerName: project.customername,
    status,
    dueDate: project.due_date,
    createdAt: project.createdon,
    location: project.sitelocationaddress 
      ? `${project.sitelocationaddress}, ${project.sitelocationcity || ''} ${project.sitelocationstate || ''} ${project.sitelocationzip || ''}`.trim()
      : undefined,
    budget: project.budget,
    spent: project.spent,
    progress: project.progress
  };
};

export const workOrderToWorkItem = (workOrder: WorkOrder): WorkItem => {
  // First get the status with a default
  const rawStatus = workOrder.status?.toLowerCase() || '';
  // Then map it to a valid StatusType
  let status: StatusType;
  
  switch (rawStatus) {
    case 'active':
    case 'completed':
    case 'pending':
    case 'cancelled':
    case 'on-hold':
      status = rawStatus as StatusType;
      break;
    default:
      status = 'not_set';
  }
    
  return {
    id: workOrder.work_order_id,
    type: 'workOrder',
    title: workOrder.title,
    description: workOrder.description,
    customerId: workOrder.customer_id,
    customerName: '', // This would need to be fetched separately 
    status,
    dueDate: workOrder.scheduled_date,
    createdAt: workOrder.created_at,
    location: workOrder.location_id?.toString(),
    progress: workOrder.progress,
    priority: workOrder.priority,
    assignedTo: workOrder.assigned_to?.toString(),
    poNumber: workOrder.po_number
  };
};
