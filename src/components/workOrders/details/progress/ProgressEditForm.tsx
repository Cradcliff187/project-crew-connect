
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface ProgressEditFormProps {
  progressValue: number;
  onProgressChange: (value: number) => void;
  loading: boolean;
}

const ProgressEditForm = ({ 
  progressValue, 
  onProgressChange,
  loading
}: ProgressEditFormProps) => {
  return (
    <div className="mt-4 space-y-3">
      <div>
        <label className="text-sm font-medium mb-2 block">Update Progress</label>
        <Slider
          value={[progressValue]}
          max={100}
          step={5}
          onValueChange={(value) => onProgressChange(value[0])}
          disabled={loading}
          className="my-4"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={progressValue}
          onChange={(e) => onProgressChange(Number(e.target.value))}
          min={0}
          max={100}
          className="w-24"
          disabled={loading}
        />
        <span>%</span>
      </div>
      
      <p className="text-xs text-muted-foreground mt-1">
        {progressValue === 0 && "Work has not started yet"}
        {progressValue > 0 && progressValue < 50 && "Work is in the early stages"}
        {progressValue >= 50 && progressValue < 100 && "Work is progressing well"}
        {progressValue === 100 && "Work is now complete"}
      </p>
    </div>
  );
};

export default ProgressEditForm;
