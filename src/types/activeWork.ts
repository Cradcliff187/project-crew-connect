import { StatusType } from './common';

export interface WorkItem {
  id: string;
  title: string;
  type: 'project' | 'workOrder' | 'estimate';
  status: StatusType;
  dueDate?: string | null;
  customerName?: string;
  progress?: number;
  href?: string;
  description?: string;
  priority?: string;
  customerId?: string;
  location?: string;
  createdAt?: string;
  poNumber?: string;
  assignedTo?: string;
  budget?: number;
  spent?: number;
}

export const projectToWorkItem = (project: any): WorkItem => {
  return {
    id: project.projectid,
    title: project.projectname,
    type: 'project',
    status: project.status || 'active',
    dueDate: project.target_end_date || project.due_date,
    customerName: project.customername || '',
    progress: project.progress || 0,
    href: `/projects/${project.projectid}`,
    budget: project.budget || 0,
    spent: project.spent || 0,
    createdAt: project.createdon,
  };
};
