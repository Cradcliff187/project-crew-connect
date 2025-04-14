import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export interface EntityTypeSelectorProps {
  value: 'work_order' | 'project';
  onChange: (value: 'work_order' | 'project') => void;
}

const EntityTypeSelector: React.FC<EntityTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <Label>Type</Label>
      <RadioGroup value={value} onValueChange={onChange} className="flex gap-6">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="work_order" id="work_order" />
          <Label htmlFor="work_order" className="cursor-pointer">
            Work Order
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="project" id="project" />
          <Label htmlFor="project" className="cursor-pointer">
            Project
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default EntityTypeSelector;
