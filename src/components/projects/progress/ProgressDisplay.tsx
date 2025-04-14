import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressDisplayProps {
  progressValue: number;
  showLabel?: boolean;
  className?: string;
}

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
  progressValue,
  showLabel = true,
  className = '',
}) => {
  // Ensure progress value is between 0 and 100
  const normalizedProgress = Math.min(Math.max(0, progressValue), 100);

  // Function to determine progress bar color based on value
  const getProgressColor = (value: number): string => {
    if (value >= 75) return 'bg-sage-500';
    if (value >= 40) return 'bg-construction-600';
    return 'bg-earth-500';
  };

  const progressColor = getProgressColor(normalizedProgress);

  return (
    <div className={`space-y-2 ${className}`}>
      <Progress value={normalizedProgress} className="h-2" indicatorClassName={progressColor} />
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium">{Math.round(normalizedProgress)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressDisplay;
