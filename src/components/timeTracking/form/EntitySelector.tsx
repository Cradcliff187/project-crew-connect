
import React from 'react';

export interface EntitySelectorProps {
  entityType: string;
  entityId: string;
  workOrders: { id: string; title: string; location?: string }[];
  projects: { id: string; title: string; location?: string }[];
  isLoading: boolean;
  onChange: (value: string) => void;
  error?: string;
  selectedEntity?: { id: string; title: string; location?: string } | null;
  required?: boolean;
  label?: string;
  fieldName?: string;
  control?: any;
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
  required = false,
  label,
}) => {
  const entities = entityType === 'work_order' ? workOrders : projects;
  
  return (
    <div className="space-y-2">
      <label htmlFor="entity" className="block text-gray-700 font-medium">
        {label || (entityType === 'work_order' ? 'Work Order' : 'Project')}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id="entity"
        className="w-full border border-gray-300 rounded-md p-2"
        value={entityId}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        required={required}
      >
        <option value="">Select a {entityType === 'work_order' ? 'work order' : 'project'}</option>
        {entities.map((entity) => (
          <option key={entity.id} value={entity.id}>
            {entity.title}
          </option>
        ))}
      </select>
      
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      
      {selectedEntity && (
        <div className="mt-2 text-sm text-gray-600">
          {selectedEntity.location && (
            <div className="text-gray-500">
              Location: {selectedEntity.location}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EntitySelector;
