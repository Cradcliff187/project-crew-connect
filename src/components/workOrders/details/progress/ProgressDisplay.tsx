
import { Progress } from '@/components/ui/progress';

interface ProgressDisplayProps {
  progressValue: number;
}

const ProgressDisplay = ({ progressValue }: ProgressDisplayProps) => {
  // Function to determine progress bar color based on value
  const getProgressColor = (value: number): string => {
    if (value >= 80) return 'bg-sage-500';
    if (value >= 40) return 'bg-construction-600';
    return 'bg-earth-500';
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
          className="h-4 bg-warmgray-100" 
          indicatorClassName={progressColor}
        />
      </div>
      
      {progressValue === 100 && (
        <p className="text-xs text-sage-600 mt-1">Work order is complete!</p>
      )}
      {progressValue > 0 && progressValue < 100 && (
        <p className="text-xs text-construction-600 mt-1">Work is in progress</p>
      )}
      {progressValue === 0 && (
        <p className="text-xs text-warmgray-600 mt-1">Work has not started</p>
      )}
    </div>
  );
};

export default ProgressDisplay;
