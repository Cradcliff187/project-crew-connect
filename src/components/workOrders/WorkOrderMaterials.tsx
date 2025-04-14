import React from 'react';
import MaterialsInterface from './materials/MaterialsInterface';

interface WorkOrderMaterialsProps {
  workOrderId: string;
  onMaterialAdded?: () => void;
}

const WorkOrderMaterials: React.FC<WorkOrderMaterialsProps> = ({
  workOrderId,
  onMaterialAdded,
}) => {
  return (
    <div className="space-y-6">
      <MaterialsInterface workOrderId={workOrderId} onMaterialAdded={onMaterialAdded} />
    </div>
  );
};

export default WorkOrderMaterials;
