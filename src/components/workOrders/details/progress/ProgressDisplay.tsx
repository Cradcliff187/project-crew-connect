
import { Progress } from '@/components/ui/progress';

interface ProgressDisplayProps {
  progressValue: number;
}

const ProgressDisplay = ({ progressValue }: ProgressDisplayProps) => {
  // Function to determine progress bar color based on value
  const getProgressColor = (value: number): string => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 40) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  const progressColor = getProgressColor(progressValue);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{progressValue}% Complete</span>
      </div>
      <div className="flex items-center gap-2">
        <Progress 
          value={progressValue} 
          className="h-4 bg-gray-100" 
          indicatorClassName={progressColor}
        />
      </div>
      
      {progressValue === 100 && (
        <p className="text-xs text-green-600 mt-1">Work order is complete!</p>
      )}
      {progressValue > 0 && progressValue < 100 && (
        <p className="text-xs text-gray-500 mt-1">Work is in progress</p>
      )}
      {progressValue === 0 && (
        <p className="text-xs text-gray-500 mt-1">Work has not started</p>
      )}
    </div>
  );
};

export default ProgressDisplay;
