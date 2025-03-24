
import { Button } from '@/components/ui/button';
import { Briefcase, Wrench } from 'lucide-react';

interface EntityTypeSelectorProps {
  entityType: 'work_order' | 'project';
  onChange: (value: 'work_order' | 'project') => void;
}

const EntityTypeSelector: React.FC<EntityTypeSelectorProps> = ({ entityType, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Time Entry Type</label>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant={entityType === 'work_order' ? 'default' : 'outline'}
          className={entityType === 'work_order' ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
          onClick={() => onChange('work_order')}
        >
          <Wrench className="h-4 w-4 mr-2" />
          Work Order
        </Button>
        
        <Button
          type="button"
          variant={entityType === 'project' ? 'default' : 'outline'}
          className={entityType === 'project' ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
          onClick={() => onChange('project')}
        >
          <Briefcase className="h-4 w-4 mr-2" />
          Project
        </Button>
      </div>
    </div>
  );
};

export default EntityTypeSelector;
