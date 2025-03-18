
import { StatusType } from './common';

// Common interface for both projects and work orders
export interface WorkItem {
  id: string;
  type: 'project' | 'workOrder';
  title: string;
  description?: string;
  status: StatusType;
  customerId?: string;
  customerName?: string;
  createdAt: string;
  progress: number;
  budget?: number;
  spent?: number;
  priority?: string;
  dueDate?: string;
  poNumber?: string; // Specific to work orders
  location?: string; // Specific to work orders
  assignedTo?: string; // Specific to work orders
}

// Helper functions to convert project and work order objects to WorkItem
export const projectToWorkItem = (project: any): WorkItem => ({
  id: project.projectid,
  type: 'project',
  title: project.projectname || 'Unnamed Project',
  status: project.status,
  customerId: project.customerid,
  customerName: project.customername,
  createdAt: project.createdon,
  progress: project.progress || 0,
  budget: project.budget,
  spent: project.spent
});

export const workOrderToWorkItem = (workOrder: any): WorkItem => ({
  id: workOrder.work_order_id,
  type: 'workOrder',
  title: workOrder.title,
  description: workOrder.description,
  status: workOrder.status,
  customerId: workOrder.customer_id,
  createdAt: workOrder.created_at,
  progress: workOrder.progress,
  poNumber: workOrder.po_number,
  priority: workOrder.priority,
  dueDate: workOrder.scheduled_date,
  location: workOrder.location_id,
  assignedTo: workOrder.assigned_to
});
