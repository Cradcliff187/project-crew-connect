
import React from 'react';
import { MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface WorkOrderOrProject {
  id: string;
  title: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  description?: string;
  status?: string;
}

interface EntitySelectorProps {
  entityType: 'work_order' | 'project';
  entityId: string;
  workOrders: WorkOrderOrProject[];
  projects: WorkOrderOrProject[];
  isLoading: boolean;
  onChange: (value: string) => void;
  error?: string;
  selectedEntity: WorkOrderOrProject | null;
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
  const getEntityOptions = () => {
    const entities = entityType === 'work_order' ? workOrders : projects;
    return entities.map(entity => (
      <HoverCard key={entity.id}>
        <HoverCardTrigger asChild>
          <SelectItem value={entity.id}>
            {entity.title || `${entityType === 'work_order' ? 'Work Order' : 'Project'} ${entity.id}`}
          </SelectItem>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium">{entity.title}</h4>
            {entity.status && (
              <div className="text-xs rounded-full bg-amber-100 text-amber-800 inline-block px-2 py-1">
                {entity.status}
              </div>
            )}
            {entity.description && (
              <p className="text-sm text-muted-foreground">
                {entity.description}
              </p>
            )}
            {entity.location && (
              <div className="flex items-center text-sm">
                <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <span>{entity.location}</span>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    ));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="entity">
        Select {entityType === 'work_order' ? 'Work Order' : 'Project'}
      </Label>
      <Select
        value={entityId}
        onValueChange={onChange}
      >
        <SelectTrigger id="entity" className="w-full">
          <SelectValue placeholder={`Select a ${entityType === 'work_order' ? 'work order' : 'project'}`} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : getEntityOptions().length > 0 ? (
            getEntityOptions()
          ) : (
            <SelectItem value="none" disabled>No {entityType === 'work_order' ? 'work orders' : 'projects'} found</SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      
      {selectedEntity && (
        <div className="mt-2 p-3 bg-muted rounded-md text-sm">
          <div className="font-medium">{selectedEntity.title}</div>
          {selectedEntity.location && (
            <div className="flex items-center mt-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{selectedEntity.location}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EntitySelector;
