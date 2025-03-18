
import { Progress } from '@/components/ui/progress';

interface ProgressDisplayProps {
  progressValue: number;
}

const ProgressDisplay = ({ progressValue }: ProgressDisplayProps) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Progress value={progressValue} className="h-4" />
      <span className="font-medium">{progressValue}%</span>
    </div>
  );
};

export default ProgressDisplay;
