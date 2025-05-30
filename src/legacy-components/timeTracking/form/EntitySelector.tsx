import React from 'react';
import { Label } from '@/components/ui/label';
import { Briefcase, Building, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Entity } from '@/types/timeTracking';

interface EntitySelectorProps {
  entityType: 'work_order' | 'project';
  entityId: string;
  workOrders: Entity[];
  projects: Entity[];
  isLoading: boolean;
  onChange: (value: string) => void;
  error?: string;
  selectedEntity?: { name: string; location?: string } | null;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({
  entityType,
  entityId,
  workOrders,
  projects,
  isLoading,
  onChange,
  error,
  selectedEntity,
}) => {
  const entities = entityType === 'work_order' ? workOrders : projects;

  return (
    <div className="space-y-2">
      <Label>{entityType === 'work_order' ? 'Work Order' : 'Project'}</Label>

      {isLoading ? (
        <div className="flex items-center space-x-2 border rounded-md p-2 h-10">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      ) : (
        <>
          <Select value={entityId} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={`Select ${entityType === 'work_order' ? 'work order' : 'project'}`}
              />
            </SelectTrigger>
            <SelectContent>
              {entities.length > 0 ? (
                entities.map(entity => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))
              ) : (
                <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                  No {entityType === 'work_order' ? 'work orders' : 'projects'} found
                </div>
              )}
            </SelectContent>
          </Select>

          {entities.length === 0 && (
            <div className="text-xs flex items-center text-amber-600 gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>
                No {entityType === 'work_order' ? 'work orders' : 'projects'} available in the
                database
              </span>
            </div>
          )}

          {entities.length > 0 && (
            <div className="text-xs text-gray-400">
              {entities.length} {entityType === 'work_order' ? 'work orders' : 'projects'} available
            </div>
          )}
        </>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {selectedEntity && (
        <div className="mt-2 p-3 bg-muted rounded-md">
          <div className="flex items-center">
            {entityType === 'work_order' ? (
              <Briefcase className="h-4 w-4 mr-2 text-[#0485ea]" />
            ) : (
              <Building className="h-4 w-4 mr-2 text-[#0485ea]" />
            )}
            <span className="font-medium">{selectedEntity.name}</span>
          </div>
          {selectedEntity.location && (
            <p className="text-xs text-muted-foreground mt-1 ml-6">{selectedEntity.location}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EntitySelector;
