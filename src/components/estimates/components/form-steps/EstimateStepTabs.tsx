
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface EstimateStep {
  id: string;
  label: string;
  description?: string;  // Adding this property
  order?: number;        // Adding this property
}

export const ESTIMATE_STEPS: EstimateStep[] = [
  {
    id: "customer",
    label: "Customer",
    description: "Customer information",
    order: 1
  },
  {
    id: "details",
    label: "Details",
    description: "Estimate details",
    order: 2
  },
  {
    id: "items",
    label: "Line Items",
    description: "Items to be included in the estimate",
    order: 3
  },
  {
    id: "documents",
    label: "Documents",
    description: "Attach relevant documents",
    order: 4
  },
  {
    id: "preview",
    label: "Preview",
    description: "Review the estimate",
    order: 5
  }
];

interface EstimateStepTabsProps {
  currentStep: string;
  onStepChange: (step: string) => void;
  disabled?: boolean;
}

const EstimateStepTabs: React.FC<EstimateStepTabsProps> = ({
  currentStep,
  onStepChange,
  disabled = false
}) => {
  return (
    <Tabs value={currentStep} onValueChange={onStepChange} className="w-full">
      <TabsList className="grid grid-cols-5 w-full">
        {ESTIMATE_STEPS.map((step) => (
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

export default EstimateStepTabs;
