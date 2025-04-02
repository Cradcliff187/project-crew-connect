
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
import { AlertCircle, Loader2 } from 'lucide-react';

interface EntitySelectorProps {
  control: Control<DocumentUploadFormValues>;
  entityType?: EntityType; // Make this optional
  isReceiptUpload?: boolean;
}

interface EntityOption {
  id: string;
  name: string;
}

const EntitySelector: React.FC<EntitySelectorProps> = ({ 
  control, 
  entityType: propEntityType,
  isReceiptUpload = false 
}) => {
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
            setError(null);
            
            try {
              let data: EntityOption[] = [];
              
              switch (entityType) {
                case 'PROJECT':
                  const { data: projects, error: projectsError } = await supabase
                    .from('projects')
                    .select('projectid, projectname');
                    
                  if (projectsError) throw projectsError;
                  
                  data = (projects || []).map(p => ({ 
                    id: p.projectid, 
                    name: p.projectname || p.projectid 
                  }));
                  break;
                  
                case 'CUSTOMER':
                  const { data: customers, error: customersError } = await supabase
                    .from('customers')
                    .select('customerid, customername');
                    
                  if (customersError) throw customersError;
                  
                  data = (customers || []).map(c => ({ 
                    id: c.customerid, 
                    name: c.customername || c.customerid 
                  }));
                  break;
                  
                case 'ESTIMATE':
                  const { data: estimates, error: estimatesError } = await supabase
                    .from('estimates')
                    .select('estimateid, projectname');
                    
                  if (estimatesError) throw estimatesError;
                  
                  data = (estimates || []).map(e => ({ 
                    id: e.estimateid, 
                    name: e.projectname || e.estimateid 
                  }));
                  break;
                  
                case 'WORK_ORDER':
                  // Here we use proper filtering method instead of relying on URL parameters
                  const { data: workOrders, error: workOrdersError } = await supabase
                    .from('maintenance_work_orders')
                    .select('work_order_id, title');
                    
                  if (workOrdersError) throw workOrdersError;
                  
                  data = (workOrders || []).map(w => ({ 
                    id: w.work_order_id, 
                    name: w.title || w.work_order_id 
                  }));
                  break;
                  
                case 'VENDOR':
                  const { data: vendors, error: vendorsError } = await supabase
                    .from('vendors')
                    .select('vendorid, vendorname');
                    
                  if (vendorsError) throw vendorsError;
                  
                  data = (vendors || []).map(v => ({ 
                    id: v.vendorid, 
                    name: v.vendorname || v.vendorid 
                  }));
                  break;
                  
                case 'SUBCONTRACTOR':
                  const { data: subcontractors, error: subcontractorsError } = await supabase
                    .from('subcontractors')
                    .select('subid, subname');
                    
                  if (subcontractorsError) throw subcontractorsError;
                  
                  data = (subcontractors || []).map(s => ({ 
                    id: s.subid, 
                    name: s.subname || s.subid 
                  }));
                  break;
                  
                case 'EMPLOYEE':
                  const { data: employees, error: employeesError } = await supabase
                    .from('employees')
                    .select('employee_id, first_name, last_name');
                    
                  if (employeesError) throw employeesError;
                  
                  data = (employees || []).map(e => ({ 
                    id: e.employee_id, 
                    name: `${e.first_name} ${e.last_name}` 
                  }));
                  break;
                  
                case 'TIME_ENTRY':
                  // Here we use proper filtering method instead of relying on URL parameters
                  const { data: timeEntries, error: timeEntriesError } = await supabase
                    .from('time_entries')
                    .select('id, entity_id, date_worked');
                    
                  if (timeEntriesError) throw timeEntriesError;
                  
                  data = (timeEntries || []).map(t => ({ 
                    id: t.id, 
                    name: `Time Entry: ${new Date(t.date_worked).toLocaleDateString()} (${t.entity_id})` 
                  }));
                  break;
                  
                default:
                  data = [];
              }
              
              setEntities(data);
            } catch (error: any) {
              console.error('Error fetching entities:', error);
              setError(error.message || 'Failed to load entities');
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {entityType ? `${entityType.replace(/_/g, ' ')} ID` : 'Entity ID'}
                </FormLabel>
                {loading ? (
                  <div className="flex items-center space-x-2 h-10 px-3 border rounded-md bg-background">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Loading options...</span>
                  </div>
                ) : error ? (
                  <div>
                    <Input 
                      placeholder={`Enter ${entityType?.toLowerCase() || 'entity'} ID manually`}
                      {...field}
                      disabled={isReceiptUpload && !!field.value}
                    />
                    <div className="flex items-center mt-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      <span>Could not load options: {error}</span>
                    </div>
                  </div>
                ) : entities.length > 0 ? (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isReceiptUpload && !!field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${entityType?.toLowerCase() || 'entity'}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id || "_placeholder"}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    placeholder={`Enter ${entityType?.toLowerCase() || 'entity'} ID`}
                    {...field}
                    disabled={isReceiptUpload && !!field.value}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }}
    />
  );
};

export default EntitySelector;
