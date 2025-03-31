
import React, { useEffect, useState } from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DocumentUploadFormValues, EntityType } from '../schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';

interface EntitySelectorProps {
  control: Control<DocumentUploadFormValues>;
  entityType?: EntityType; // Make this optional
  isReceiptUpload?: boolean;
  instanceId?: string; // Added instanceId prop
}

interface EntityOption {
  id: string;
  name: string;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({ 
  control, 
  entityType: propEntityType,
  isReceiptUpload = false,
  instanceId = 'default-entity'  // Default value
}) => {
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Use this component with the form controller to get the entity type from the form if not provided as prop
  return (
    <FormField
      control={control}
      name="metadata.entityType"
      render={({ field: entityTypeField }) => {
        // Use prop entityType if provided, otherwise use the form value
        const entityType = propEntityType || entityTypeField.value;
        
        useEffect(() => {
          const fetchEntities = async () => {
            if (!entityType) return;
            
            setLoading(true);
            try {
              let data: EntityOption[] = [];
              
              switch (entityType) {
                case 'PROJECT':
                  const { data: projects } = await supabase
                    .from('projects')
                    .select('projectid, projectname');
                  data = (projects || []).map(p => ({ 
                    id: p.projectid, 
                    name: p.projectname || p.projectid 
                  }));
                  break;
                  
                case 'CUSTOMER':
                  const { data: customers } = await supabase
                    .from('customers')
                    .select('customerid, customername');
                  data = (customers || []).map(c => ({ 
                    id: c.customerid, 
                    name: c.customername || c.customerid 
                  }));
                  break;
                  
                case 'ESTIMATE':
                  const { data: estimates } = await supabase
                    .from('estimates')
                    .select('estimateid, projectname');
                  data = (estimates || []).map(e => ({ 
                    id: e.estimateid, 
                    name: e.projectname || e.estimateid 
                  }));
                  break;
                  
                case 'WORK_ORDER':
                  // Here we use proper filtering method instead of relying on URL parameters
                  const { data: workOrders } = await supabase
                    .from('maintenance_work_orders')
                    .select('work_order_id, title');
                  data = (workOrders || []).map(w => ({ 
                    id: w.work_order_id, 
                    name: w.title || w.work_order_id 
                  }));
                  break;
                  
                case 'VENDOR':
                  const { data: vendors } = await supabase
                    .from('vendors')
                    .select('vendorid, vendorname');
                  data = (vendors || []).map(v => ({ 
                    id: v.vendorid, 
                    name: v.vendorname || v.vendorid 
                  }));
                  break;
                  
                case 'SUBCONTRACTOR':
                  const { data: subcontractors } = await supabase
                    .from('subcontractors')
                    .select('subid, subname');
                  data = (subcontractors || []).map(s => ({ 
                    id: s.subid, 
                    name: s.subname || s.subid 
                  }));
                  break;
                  
                case 'EMPLOYEE':
                  const { data: employees } = await supabase
                    .from('employees')
                    .select('employee_id, first_name, last_name');
                  data = (employees || []).map(e => ({ 
                    id: e.employee_id, 
                    name: `${e.first_name} ${e.last_name}` 
                  }));
                  break;
                  
                case 'TIME_ENTRY':
                  // Here we use proper filtering method instead of relying on URL parameters
                  const { data: timeEntries } = await supabase
                    .from('time_entries')
                    .select('id, entity_id, date_worked');
                  data = (timeEntries || []).map(t => ({ 
                    id: t.id, 
                    name: `Time Entry: ${new Date(t.date_worked).toLocaleDateString()} (${t.entity_id})` 
                  }));
                  break;
                  
                // Display a single item for temp IDs when we're in ESTIMATE_ITEM context
                case 'ESTIMATE_ITEM':
                  // For temporary estimate items, we'll handle the display differently
                  // No need to fetch from the database
                  break;
                  
                default:
                  data = [];
              }
              
              setEntities(data);
            } catch (error) {
              console.error('Error fetching entities:', error);
            } finally {
              setLoading(false);
            }
          };
          
          if (entityType) {
            fetchEntities();
          }
        }, [entityType]);
        
        // Now render the entity ID selector
        return (
          <FormField
            control={control}
            name="metadata.entityId"
            render={({ field }) => {
              // For temporary ESTIMATE_ITEM entities, display a friendly message
              const isTempEstimateItem = entityType === 'ESTIMATE_ITEM' && field.value && field.value.includes('temp-');
              
              return (
                <FormItem>
                  <FormLabel>
                    {entityType ? `${entityType.replace(/_/g, ' ')} ID` : 'Entity ID'}
                  </FormLabel>
                  
                  {/* Special handling for temporary estimate items */}
                  {isTempEstimateItem ? (
                    <div className="text-sm p-2 bg-blue-50 rounded border border-blue-100">
                      Document will be attached to this line item. The permanent ID will be assigned when the estimate is saved.
                    </div>
                  ) : entities.length > 0 ? (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isReceiptUpload && !!field.value}
                    >
                      <FormControl>
                        <SelectTrigger id={`${instanceId}-entity-trigger`}>
                          <SelectValue placeholder={`Select a ${entityType ? entityType.toLowerCase().replace(/_/g, ' ') : 'entity'}`} />
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
                  ) : (
                    <FormControl>
                      <Input
                        {...field}
                        id={`${instanceId}-entity-input`}
                        placeholder={loading ? "Loading..." : `Enter ${entityType ? entityType.toLowerCase().replace(/_/g, ' ') : 'entity'} ID`}
                        disabled={loading || (isReceiptUpload && !!field.value)}
                        className={isTempEstimateItem ? "opacity-50" : ""}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        );
      }}
    />
  );
};

export default EntitySelector;
