
import React, { useState, useEffect } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues } from './schemas/documentSchema';

interface EntitySelectorProps {
  control: Control<DocumentUploadFormValues>;
  entityType: string;
  fieldName: string;
  label: string;
  prefillEntityId?: string;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({ 
  control, 
  entityType, 
  fieldName, 
  label, 
  prefillEntityId 
}) => {
  const [initialEntity, setInitialEntity] = useState<string | undefined>(prefillEntityId);

  const { data: entities = [], isLoading } = useQuery({
    queryKey: [`${entityType.toLowerCase()}-list`],
    queryFn: async () => {
      let query;
      
      switch (entityType) {
        case 'VENDOR':
          query = supabase
            .from('vendors')
            .select('vendorid, vendorname')
            .order('vendorname');
          break;
        case 'SUBCONTRACTOR':
          query = supabase
            .from('subcontractors')
            .select('subid, subname')
            .order('subname');
          break;
        case 'PROJECT':
          query = supabase
            .from('projects')
            .select('projectid, projectname')
            .order('projectname');
          break;
        case 'CUSTOMER':
          query = supabase
            .from('customers')
            .select('customerid, customername')
            .order('customername');
          break;
        default:
          return [];
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${entityType.toLowerCase()} list:`, error);
        return [];
      }

      return data.map(item => ({
        id: entityType === 'VENDOR' ? item.vendorid : 
             entityType === 'SUBCONTRACTOR' ? item.subid :
             entityType === 'PROJECT' ? item.projectid :
             item.customerid,
        name: entityType === 'VENDOR' ? item.vendorname : 
              entityType === 'SUBCONTRACTOR' ? item.subname :
              entityType === 'PROJECT' ? item.projectname :
              item.customername
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set initial value if prefillEntityId is provided
  useEffect(() => {
    if (prefillEntityId && prefillEntityId !== initialEntity) {
      setInitialEntity(prefillEntityId);
    }
  }, [prefillEntityId]);

  // For updating the value when we navigate to different entities
  useEffect(() => {
    // Reset when entityType changes
    if (!prefillEntityId) {
      setInitialEntity(undefined);
    }
  }, [entityType]);

  return (
    <FormField
      control={control}
      name={fieldName as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            value={field.value?.toString() || ''}
            onValueChange={(value: string) => field.onChange(value)}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${label}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {entities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default EntitySelector;
