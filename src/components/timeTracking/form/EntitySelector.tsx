
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Building, Briefcase } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface EntitySelectorProps {
  entityType: 'work_order' | 'project';
  entityId: string;
  workOrders: { id: string; name: string }[];
  projects: { id: string; name: string }[];
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
  selectedEntity
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const options = entityType === 'work_order' ? workOrders : projects;
  
  // Filter options based on search
  const filteredOptions = options.filter(
    option => option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Reset search when entity type changes
  useEffect(() => {
    setSearchQuery('');
  }, [entityType]);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="entity">
        {entityType === 'work_order' ? 'Work Order' : 'Project'}
      </Label>
      
      <div className="space-y-2">
        <Select
          value={entityId}
          onValueChange={onChange}
          disabled={isLoading}
        >
          <SelectTrigger id="entity" className={entityId ? '' : 'text-muted-foreground'}>
            <SelectValue placeholder={`Select ${entityType === 'work_order' ? 'work order' : 'project'}`}>
              {selectedEntity?.name || `Select ${entityType === 'work_order' ? 'work order' : 'project'}`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <div className="p-2 border-b">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-0"
              />
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center p-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </div>
            ) : filteredOptions.length > 0 ? (
              <div className={isMobile ? "max-h-[200px] overflow-y-auto" : ""}>
                {filteredOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    <div className="flex items-center">
                      {entityType === 'work_order' ? (
                        <Briefcase className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      ) : (
                        <Building className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      )}
                      <span className="truncate">{option.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            ) : (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No {entityType === 'work_order' ? 'work orders' : 'projects'} found
              </div>
            )}
          </SelectContent>
        </Select>
        
        {error && <div className="text-sm text-destructive">{error}</div>}
        
        {selectedEntity && entityId && (
          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            <div className="font-medium">
              {entityType === 'work_order' ? (
                <div className="flex items-center">
                  <Briefcase className="h-3.5 w-3.5 mr-1.5 text-[#0485ea]" />
                  {selectedEntity.name}
                </div>
              ) : (
                <div className="flex items-center">
                  <Building className="h-3.5 w-3.5 mr-1.5 text-[#0485ea]" />
                  {selectedEntity.name}
                </div>
              )}
            </div>
            
            {selectedEntity.location && (
              <div className="text-xs text-muted-foreground mt-1 ml-5">
                {selectedEntity.location}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntitySelector;
