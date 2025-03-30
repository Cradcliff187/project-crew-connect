
import { CalendarIcon, ClipboardCheckIcon, FileTextIcon, LayoutGridIcon } from "lucide-react";

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
    description: 'Project and customer details'
  },
  { 
    id: 'line-items', 
    label: 'Line Items',
    icon: <ClipboardCheckIcon className="h-4 w-4" />,
    description: 'Services and materials'
  },
  { 
    id: 'documents', 
    label: 'Documents',
    icon: <FileTextIcon className="h-4 w-4" />,
    description: 'Attach supporting documents'
  },
  { 
    id: 'review', 
    label: 'Review',
    icon: <CalendarIcon className="h-4 w-4" />,
    description: 'Review and submit'
  }
];
