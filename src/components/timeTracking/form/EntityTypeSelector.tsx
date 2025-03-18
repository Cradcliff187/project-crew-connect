
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface EntityTypeSelectorProps {
  entityType: 'work_order' | 'project';
  onChange: (value: 'work_order' | 'project') => void;
}

const EntityTypeSelector: React.FC<EntityTypeSelectorProps> = ({ entityType, onChange }) => {
  return (
    <div className="space-y-2">
      <Label>What are you logging time for?</Label>
      <RadioGroup
        value={entityType}
        onValueChange={(value: 'work_order' | 'project') => onChange(value)}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="work_order" id="work_order" />
          <Label htmlFor="work_order" className="cursor-pointer">Work Order</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="project" id="project" />
          <Label htmlFor="project" className="cursor-pointer">Project</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default EntityTypeSelector;
