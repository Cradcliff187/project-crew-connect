
import { StatusType } from './common';

export interface WorkItem {
  id: string;
  title: string;
  type: 'project' | 'workOrder' | 'estimate';
  status: StatusType;
  dueDate?: string | null;
  customerName?: string;
  progress?: number;
  href?: string; // Adding href property to WorkItem type
}

export const projectToWorkItem = (project: any): WorkItem => {
  return {
    id: project.projectid,
    title: project.projectname,
    type: 'project',
    status: project.status || 'active',
    dueDate: project.due_date,
    customerName: project.customername || '',
    progress: project.progress || 0,
    href: `/projects/${project.projectid}`
  };
};
