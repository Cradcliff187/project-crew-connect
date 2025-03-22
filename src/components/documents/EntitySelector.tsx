
import React, { useState, useEffect } from 'react';
import { Control, Controller } from 'react-hook-form';
import { DocumentUploadFormValues } from './schemas/documentSchema';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface EntitySelectorProps {
  control: Control<DocumentUploadFormValues>;
  entityType: 'VENDOR' | 'SUBCONTRACTOR';
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
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Initialize entity from prefill if available
  useEffect(() => {
    if (prefillEntityId) {
      console.log(`Prefilling ${entityType.toLowerCase()} ID:`, prefillEntityId);
    }
  }, [prefillEntityId, entityType]);

  // Fetch entities (vendors or subcontractors)
  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);
      try {
        let data, error;
        
        if (entityType === 'VENDOR') {
          // Fetch vendors
          const result = await supabase
            .from('vendors')
            .select('vendorid, vendorname')
            .order('vendorname');
            
          data = result.data;
          error = result.error;
          
          if (error) throw error;
          
          const formattedEntities = data?.map(v => ({
            id: v.vendorid,
            name: v.vendorname
          }));
          setEntities(formattedEntities || []);
        } else if (entityType === 'SUBCONTRACTOR') {
          // Fetch subcontractors
          const result = await supabase
            .from('subcontractors')
            .select('subid, subname')
            .order('subname');
            
          data = result.data;
          error = result.error;
          
          if (error) throw error;
          
          const formattedEntities = data?.map(s => ({
            id: s.subid,
            name: s.subname
          }));
          setEntities(formattedEntities || []);
        }
      } catch (error) {
        console.error(`Error fetching ${entityType.toLowerCase()}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntities();
  }, [entityType]);
  
  return (
    <div className="space-y-4">
      <div>
        <Label>{label}</Label>
        <Controller
          name={fieldName}
          control={control}
          defaultValue={prefillEntityId || ""}
          render={({ field }) => (
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
              disabled={loading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {entities.map(entity => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
};

export default EntitySelector;
