
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { EntityType, InternalEntityType } from '../schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';

interface EntityOption {
  value: string;
  label: string;
  type: string;
}

interface EntitySelectorProps {
  entityType: InternalEntityType;
  value: string | undefined;
  onChange: (value: string) => void;
  onClear?: () => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export function EntitySelector({
  entityType,
  value,
  onChange,
  onClear,
  label = "Select entity",
  placeholder = "Search...",
  disabled = false,
  required = false
}: EntitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntityLabel, setSelectedEntityLabel] = useState<string>("");

  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);
      try {
        let data: EntityOption[] = [];

        switch (entityType) {
          case 'PROJECT':
            const { data: projects } = await supabase
              .from('projects')
              .select('projectid, projectname')
              .order('projectname');
            data = (projects || []).map(p => ({
              value: p.projectid,
              label: p.projectname,
              type: 'PROJECT'
            }));
            break;

          case 'CUSTOMER':
            const { data: customers } = await supabase
              .from('customers')
              .select('customerid, customername')
              .order('customername');
            data = (customers || []).map(c => ({
              value: c.customerid,
              label: c.customername,
              type: 'CUSTOMER'
            }));
            break;

          case 'WORK_ORDER':
            const { data: workOrders } = await supabase
              .from('maintenance_work_orders')
              .select('work_order_id, title')
              .order('created_at', { ascending: false });
            data = (workOrders || []).map(wo => ({
              value: wo.work_order_id,
              label: wo.title,
              type: 'WORK_ORDER'
            }));
            break;

          case 'VENDOR':
            const { data: vendors } = await supabase
              .from('vendors')
              .select('vendorid, vendorname')
              .order('vendorname');
            data = (vendors || []).map(v => ({
              value: v.vendorid,
              label: v.vendorname,
              type: 'VENDOR'
            }));
            break;

          case 'SUBCONTRACTOR':
            const { data: subcontractors } = await supabase
              .from('subcontractors')
              .select('subid, subname')
              .order('subname');
            data = (subcontractors || []).map(s => ({
              value: s.subid,
              label: s.subname,
              type: 'SUBCONTRACTOR'
            }));
            break;

          case 'EMPLOYEE' as InternalEntityType:
            const { data: employees } = await supabase
              .from('employees')
              .select('employee_id, name')
              .order('name');
            data = (employees || []).map(e => ({
              value: e.employee_id,
              label: e.name,
              type: 'EMPLOYEE'
            }));
            break;

          case 'TIME_ENTRY' as InternalEntityType:
            const { data: timeEntries } = await supabase
              .from('time_entries')
              .select('id, date_worked, entity_id')
              .order('date_worked', { ascending: false });
            data = (timeEntries || []).map(te => ({
              value: te.id,
              label: `Time Entry ${new Date(te.date_worked).toLocaleDateString()}`,
              type: 'TIME_ENTRY'
            }));
            break;

          default:
            break;
        }

        setEntities(data);

        // Find and set the label for the selected value
        if (value) {
          const selectedEntity = data.find(e => e.value === value);
          if (selectedEntity) {
            setSelectedEntityLabel(selectedEntity.label);
          }
        }
      } catch (error) {
        console.error('Error fetching entities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [entityType, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {value
            ? loading
              ? "Loading..."
              : selectedEntityLabel || "Select..."
            : label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No {entityType.toLowerCase()} found.</CommandEmpty>
          <CommandGroup>
            {entities.map((entity) => (
              <CommandItem
                key={entity.value}
                value={entity.value}
                onSelect={(value) => {
                  if (value === "clear" && onClear) {
                    onClear();
                  } else {
                    onChange(value);
                    setSelectedEntityLabel(entity.label);
                  }
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === entity.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {entity.label}
              </CommandItem>
            ))}
            {!required && onClear && (
              <CommandItem
                value="clear"
                onSelect={() => {
                  onClear();
                  setOpen(false);
                }}
                className="text-muted-foreground"
              >
                Clear selection
              </CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
