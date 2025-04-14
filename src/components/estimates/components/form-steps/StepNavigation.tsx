import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface StepNavigationProps {
  isFirstStep: boolean;
  onPrevious: () => void;
  currentStep: string;
}

const StepNavigation = ({ isFirstStep, onPrevious, currentStep }: StepNavigationProps) => {
  if (isFirstStep) {
    return null;
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={onPrevious} className="ml-2">
      <ArrowLeft className="h-4 w-4 mr-1" />
      Back
    </Button>
  );
};

export default StepNavigation;
