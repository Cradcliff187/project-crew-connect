
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface EntitySelectorProps {
  entityType: 'work_order' | 'project';
  entityId: string;
  workOrders: { id: string; title: string; }[];
  projects: { id: string; title: string; }[];
  isLoading: boolean;
  onChange: (value: string) => void;
  error?: string;
  selectedEntity: { id: string; title: string; location?: string; } | null;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({
  entityType,
  entityId,
  workOrders,
  projects,
  isLoading,
  onChange,
  error,
  selectedEntity
}) => {
  const entities = entityType === 'work_order' ? workOrders : projects;
  const label = entityType === 'work_order' ? 'Work Order' : 'Project';
  
  return (
    <div className="space-y-2">
      <Label htmlFor="entity-selector" className={error ? "text-destructive" : ""}>{label}</Label>
      <Select value={entityId} onValueChange={onChange}>
        <SelectTrigger id="entity-selector" className={error ? "border-destructive" : ""}>
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder={`Select a ${entityType.replace('_', ' ')}`} />
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {entities.length === 0 ? (
              <SelectItem value="none" disabled>No {entityType.replace('_', ' ')}s found</SelectItem>
            ) : (
              entities.map(entity => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.title}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      
      {selectedEntity && selectedEntity.location && (
        <p className="text-xs text-muted-foreground mt-1">
          Location: {selectedEntity.location}
        </p>
      )}
    </div>
  );
};

export default EntitySelector;
