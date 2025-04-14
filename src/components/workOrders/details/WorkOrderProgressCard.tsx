import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/types/workOrder';
import { useWorkOrderProgress } from './hooks/useWorkOrderProgress';
import ProgressDisplay from './progress/ProgressDisplay';
import ProgressEditForm from './progress/ProgressEditForm';

interface WorkOrderProgressCardProps {
  workOrder: WorkOrder;
  onProgressUpdate: () => void;
}

const WorkOrderProgressCard = ({ workOrder, onProgressUpdate }: WorkOrderProgressCardProps) => {
  const {
    progressValue,
    setProgressValue,
    isEditing,
    loading,
    startEditing,
    handleSaveProgress,
    handleCancelEdit,
  } = useWorkOrderProgress(workOrder, onProgressUpdate);

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between w-full">
        <h3 className="text-base font-medium">Work Progress</h3>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={startEditing}>
            <Pencil className="h-4 w-4 mr-1" />
            Update
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={loading}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveProgress}
              disabled={loading}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div>
        <ProgressDisplay progressValue={progressValue} />

        {isEditing && (
          <ProgressEditForm
            progressValue={progressValue}
            onProgressChange={setProgressValue}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default WorkOrderProgressCard;
