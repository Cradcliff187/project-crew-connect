import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface WorkOrderStep {
  id: string;
  label: string;
}

export const WORK_ORDER_STEPS: WorkOrderStep[] = [
  { id: 'basic-info', label: 'Basic Info' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'location', label: 'Location' },
  { id: 'preview', label: 'Preview' },
];

interface WorkOrderStepTabsProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  isDisabled: boolean;
}

const WorkOrderStepTabs = ({ currentStep, setCurrentStep, isDisabled }: WorkOrderStepTabsProps) => {
  return (
    <Tabs value={currentStep}>
      <TabsList
        className="grid grid-cols-4 w-full h-12 p-1 bg-gray-50 border border-gray-200 rounded-lg"
        aria-label="Work Order Creation Steps"
      >
        {WORK_ORDER_STEPS.map(step => (
          <TabsTrigger
            key={step.id}
            value={step.id}
            disabled={isDisabled}
            className={`text-sm font-medium transition-all duration-200 ${
              currentStep === step.id
                ? 'bg-[#0485ea] text-white shadow-md'
                : 'hover:bg-gray-100 hover:text-[#0485ea]'
            }`}
            onClick={() => setCurrentStep(step.id)}
            aria-label={`Step: ${step.label}`}
          >
            {step.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default WorkOrderStepTabs;
