
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { SliderProps } from '@radix-ui/react-slider';
import { ChangeEvent } from 'react';

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
  const handleSliderChange = (value: number[]) => {
    onProgressChange(value[0]);
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      onProgressChange(value);
    }
  };
  
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2">
        <Slider
          disabled={loading}
          value={[progressValue]}
          onValueChange={handleSliderChange as SliderProps['onValueChange']}
          max={100}
          step={5}
          className="flex-1"
        />
        <Input
          type="number"
          value={progressValue}
          onChange={handleInputChange}
          className="w-16 text-right"
          min={0}
          max={100}
          disabled={loading}
        />
        <span className="text-sm">%</span>
      </div>
    </div>
  );
};

export default ProgressEditForm;
