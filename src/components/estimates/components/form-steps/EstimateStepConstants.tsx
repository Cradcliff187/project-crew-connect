import { CalendarIcon, ClipboardCheckIcon, FileTextIcon, LayoutGridIcon } from 'lucide-react';

export interface EstimateStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

export const ESTIMATE_STEPS: EstimateStep[] = [
  {
    id: 'basic-info',
    label: 'Basic Info',
    icon: <LayoutGridIcon className="h-4 w-4" />,
    description: 'Project and customer details',
  },
  {
    id: 'line-items',
    label: 'Line Items',
    icon: <ClipboardCheckIcon className="h-4 w-4" />,
    description: 'Services and materials',
  },
  {
    id: 'summary',
    label: 'Summary',
    icon: <FileTextIcon className="h-4 w-4" />,
    description: 'Review details',
  },
  {
    id: 'review',
    label: 'Preview',
    icon: <CalendarIcon className="h-4 w-4" />,
    description: 'Preview and submit',
  },
];
