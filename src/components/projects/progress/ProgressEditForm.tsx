
import { Input } from '@/components/ui/input';

interface ProgressEditFormProps {
  progressValue: number;
  onProgressChange: (value: number) => void;
}

const ProgressEditForm = ({ progressValue, onProgressChange }: ProgressEditFormProps) => {
  return (
    <div className="mt-4">
      <label className="text-sm font-medium mb-1 block">Update Progress</label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={progressValue}
          onChange={(e) => onProgressChange(Number(e.target.value))}
          min={0}
          max={100}
          className="w-24"
        />
        <span>%</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">Enter a value between 0 and 100</p>
    </div>
  );
};

export default ProgressEditForm;
