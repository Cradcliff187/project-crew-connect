
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface WorkOrderStep {
  id: string;
  label: string;
}

export const WORK_ORDER_STEPS: WorkOrderStep[] = [
  { id: 'basic-info', label: 'Basic Info' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'location', label: 'Location' },
  { id: 'preview', label: 'Preview' }
];

interface WorkOrderStepTabsProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  isDisabled: boolean;
}

const WorkOrderStepTabs = ({ 
  currentStep, 
  setCurrentStep, 
  isDisabled 
}: WorkOrderStepTabsProps) => {
  return (
    <Tabs value={currentStep}>
      <TabsList className="grid grid-cols-4 w-full">
        {WORK_ORDER_STEPS.map((step) => (
          <TabsTrigger
            key={step.id}
            value={step.id}
            disabled={isDisabled}
            className={currentStep === step.id ? 'bg-[#0485ea] text-white' : ''}
            onClick={() => setCurrentStep(step.id)}
          >
            {step.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default WorkOrderStepTabs;
