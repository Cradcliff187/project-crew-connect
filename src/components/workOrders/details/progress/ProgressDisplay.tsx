import { Progress } from '@/components/ui/progress';

interface ProgressDisplayProps {
  progressValue: number;
}

const ProgressDisplay = ({ progressValue }: ProgressDisplayProps) => {
  // Function to determine progress color based on value
  const getProgressColor = () => {
    if (progressValue < 25) return 'bg-gray-300';
    if (progressValue < 50) return 'bg-amber-400';
    if (progressValue < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Progress: {progressValue}%</span>
        <span>
          {progressValue === 0 && 'Not Started'}
          {progressValue > 0 && progressValue < 100 && 'In Progress'}
          {progressValue === 100 && 'Complete'}
        </span>
      </div>
      <Progress value={progressValue} className={`h-2 ${getProgressColor()}`} />
    </div>
  );
};

export default ProgressDisplay;
