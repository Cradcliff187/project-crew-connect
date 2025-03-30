
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface WorkOrderStep {
  id: string;
  label: string;
  description?: string; // Adding this property
  order?: number;       // Adding this property
}

export const WORK_ORDER_STEPS: WorkOrderStep[] = [
  {
    id: "details",
    label: "Details",
    description: "Basic work order information",
    order: 1
  },
  {
    id: "materials",
    label: "Materials",
    description: "Materials for the work order",
    order: 2
  },
  {
    id: "labor",
    label: "Labor",
    description: "Labor for the work order",
    order: 3
  },
  {
    id: "expenses",
    label: "Expenses",
    description: "Additional expenses",
    order: 4
  },
  {
    id: "notes",
    label: "Notes",
    description: "Additional notes and instructions",
    order: 5
  }
];

interface WorkOrderStepTabsProps {
  currentStep: string;
  onStepChange: (step: string) => void;
  disabled?: boolean;
}

const WorkOrderStepTabs: React.FC<WorkOrderStepTabsProps> = ({
  currentStep,
  onStepChange,
  disabled = false
}) => {
  return (
    <Tabs value={currentStep} onValueChange={onStepChange} className="w-full">
      <TabsList className="grid grid-cols-5 w-full">
        {WORK_ORDER_STEPS.map((step) => (
          <TabsTrigger
            key={step.id}
            value={step.id}
            disabled={disabled}
            className="text-xs sm:text-sm"
          >
            {step.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default WorkOrderStepTabs;
