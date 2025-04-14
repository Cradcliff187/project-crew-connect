import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProgressEditFormProps {
  projectId?: string;
  currentProgress?: number;
  progressValue?: number;
  onProgressUpdate?: () => void;
  onCancel?: () => void;
  onProgressChange?: (value: number) => void;
}

const ProgressEditForm: React.FC<ProgressEditFormProps> = ({
  projectId,
  currentProgress,
  progressValue,
  onProgressUpdate,
  onCancel,
  onProgressChange,
}) => {
  // Use either progressValue or currentProgress, with progressValue taking precedence
  const initialValue =
    progressValue !== undefined
      ? progressValue
      : currentProgress !== undefined
        ? currentProgress
        : 0;
  const [progress, setProgress] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0]);
    if (onProgressChange) {
      onProgressChange(value[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setProgress(value);
      if (onProgressChange) {
        onProgressChange(value);
      }
    }
  };

  const handleSave = async () => {
    // If we have a projectId and onProgressUpdate, we're in the ProjectProgressCard mode
    if (projectId && onProgressUpdate) {
      setSaving(true);
      try {
        // Check if a progress record exists
        const { data, error: checkError } = await supabase
          .from('project_progress')
          .select('id')
          .eq('projectid', projectId)
          .maybeSingle();

        let result;

        if (data) {
          // Update existing record
          result = await supabase
            .from('project_progress')
            .update({ progress_percentage: progress })
            .eq('projectid', projectId);
        } else {
          // Insert new record
          result = await supabase
            .from('project_progress')
            .insert({ projectid: projectId, progress_percentage: progress });
        }

        if (result.error) throw result.error;

        toast({
          title: 'Progress updated',
          description: `Project progress has been updated to ${progress}%.`,
        });

        onProgressUpdate();
      } catch (error: any) {
        console.error('Error updating progress:', error);
        toast({
          title: 'Error',
          description: 'Failed to update progress. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleProgressChange}
            className="flex-1"
          />
          <Input
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={handleInputChange}
            className="w-16"
          />
          <span className="text-sm">%</span>
        </div>
      </div>

      {/* Only show buttons if we're in ProjectProgressCard mode */}
      {projectId && onProgressUpdate && onCancel && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProgressEditForm;
