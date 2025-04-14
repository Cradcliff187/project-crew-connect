import React, { useEffect, useState } from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentUploadFormValues, EntityType } from '../schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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
  isReceiptUpload = false,
}) => {
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
                    .select('projectid, projectname')
                    .order('created_at', { ascending: false })
                    .limit(100);
                  data = (projects || []).map(p => ({
                    id: p.projectid,
                    name: p.projectname || p.projectid,
                  }));
                  break;

                case 'CUSTOMER':
                  const { data: customers } = await supabase
                    .from('customers')
                    .select('customerid, customername')
                    .order('created_at', { ascending: false })
                    .limit(100);
                  data = (customers || []).map(c => ({
                    id: c.customerid,
                    name: c.customername || c.customerid,
                  }));
                  break;

                case 'ESTIMATE':
                  const { data: estimates } = await supabase
                    .from('estimates')
                    .select('estimateid, projectname')
                    .order('created_at', { ascending: false })
                    .limit(100);
                  data = (estimates || []).map(e => ({
                    id: e.estimateid,
                    name: e.projectname || e.estimateid,
                  }));
                  break;

                case 'WORK_ORDER':
                  const { data: workOrders } = await supabase
                    .from('maintenance_work_orders')
                    .select('work_order_id, title')
                    .order('created_at', { ascending: false })
                    .limit(100);
                  data = (workOrders || []).map(w => ({
                    id: w.work_order_id,
                    name: w.title || w.work_order_id,
                  }));
                  break;

                case 'VENDOR':
                  const { data: vendors } = await supabase
                    .from('vendors')
                    .select('vendorid, vendorname')
                    .order('created_at', { ascending: false })
                    .limit(100);
                  data = (vendors || []).map(v => ({
                    id: v.vendorid,
                    name: v.vendorname || v.vendorid,
                  }));
                  break;

                case 'SUBCONTRACTOR':
                  const { data: subcontractors } = await supabase
                    .from('subcontractors')
                    .select('subid, subname')
                    .order('created_at', { ascending: false })
                    .limit(100);
                  data = (subcontractors || []).map(s => ({
                    id: s.subid,
                    name: s.subname || s.subid,
                  }));
                  break;

                case 'EMPLOYEE':
                  const { data: employees } = await supabase
                    .from('employees')
                    .select('employee_id, first_name, last_name')
                    .order('created_at', { ascending: false })
                    .limit(100);
                  data = (employees || []).map(e => ({
                    id: e.employee_id,
                    name: `${e.first_name} ${e.last_name}`,
                  }));
                  break;

                case 'TIME_ENTRY':
                  const { data: timeEntries } = await supabase
                    .from('time_entries')
                    .select('id, entity_id, date_worked')
                    .order('created_at', { ascending: false })
                    .limit(100);
                  data = (timeEntries || []).map(t => ({
                    id: t.id,
                    name: `Time Entry: ${new Date(t.date_worked).toLocaleDateString()} (${t.entity_id})`,
                  }));
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

        // Filter entities based on search term
        const filteredEntities = searchTerm
          ? entities.filter(
              entity =>
                entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entity.id.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : entities;

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
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Loading entities...
                    </div>
                  </div>
                ) : entities.length > 0 ? (
                  <div className="space-y-2">
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isReceiptUpload && !!field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Select ${entityType?.toLowerCase() || 'entity'}`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="mb-2">
                          <Input
                            placeholder="Search..."
                            className="border-dashed"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                          />
                        </div>
                        {filteredEntities.length > 0 ? (
                          filteredEntities.map(entity => (
                            <SelectItem key={entity.id} value={entity.id}>
                              <div className="truncate max-w-[280px]">
                                <span className="font-medium">{entity.name}</span>
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({entity.id})
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                            No matches found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground">
                      {entities.length} {entityType?.toLowerCase() || 'entities'} available
                    </div>
                  </div>
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
