import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface EstimateStep {
  id: string;
  label: string;
}

interface EstimateStepTabsProps {
  steps: EstimateStep[];
  currentStep: string;
  setCurrentStep: (step: string) => void;
  children?: React.ReactNode;
  className?: string;
}

const EstimateStepTabs = ({
  steps,
  currentStep,
  setCurrentStep,
  children,
  className = '',
}: EstimateStepTabsProps) => {
  return (
    <Tabs value={currentStep} className={`w-full ${className}`}>
      <TabsList
        className="grid w-full h-12 p-1 bg-gray-50 border border-gray-200 rounded-lg"
        style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
        aria-label="Estimate Creation Steps"
      >
        {steps.map(step => (
          <TabsTrigger
            key={step.id}
            value={step.id}
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

      {steps.map(step => (
        <TabsContent key={step.id} value={step.id} className="mt-0 flex-1 overflow-auto">
          {currentStep === step.id && children}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default EstimateStepTabs;
