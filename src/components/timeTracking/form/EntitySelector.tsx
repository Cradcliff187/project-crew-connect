
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { WorkOrderOrProject } from '@/types/timeTracking';

export interface EntitySelectorProps {
  control: Control<any>;
  workOrders: WorkOrderOrProject[];
  projects: WorkOrderOrProject[];
  isLoading: boolean;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({
  control,
  workOrders,
  projects,
  isLoading
}) => {
  const [entityType, setEntityType] = React.useState<'work_order' | 'project'>('work_order');
  
  // This is used to update the form value when radio changes
  const handleEntityTypeChange = (value: 'work_order' | 'project') => {
    setEntityType(value);
  };
  
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="entityType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Select Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value: 'work_order' | 'project') => {
                  field.onChange(value);
                  handleEntityTypeChange(value);
                }}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="work_order" id="work_order" />
                  <Label htmlFor="work_order">Work Order</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="project" id="project" />
                  <Label htmlFor="project">Project</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="entityId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{entityType === 'work_order' ? 'Work Order' : 'Project'}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${entityType === 'work_order' ? 'work order' : 'project'}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {entityType === 'work_order' ? (
                  workOrders.map((wo) => (
                    <SelectItem key={wo.id} value={wo.id}>
                      {wo.title}
                    </SelectItem>
                  ))
                ) : (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EntitySelector;
