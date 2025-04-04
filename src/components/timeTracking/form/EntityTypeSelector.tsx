
import React from 'react';
import { Briefcase, Building } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface EntityTypeSelectorProps {
  value: 'work_order' | 'project';
  onChange: (value: 'work_order' | 'project') => void;
}

const EntityTypeSelector: React.FC<EntityTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Type of Work</label>
      <ToggleGroup type="single" value={value} onValueChange={(val) => {
        if (val) onChange(val as 'work_order' | 'project');
      }} className="justify-start">
        <ToggleGroupItem value="work_order" className="flex items-center gap-1.5">
          <Briefcase className="h-4 w-4" />
          <span>Work Order</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="project" className="flex items-center gap-1.5">
          <Building className="h-4 w-4" />
          <span>Project</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default EntityTypeSelector;
