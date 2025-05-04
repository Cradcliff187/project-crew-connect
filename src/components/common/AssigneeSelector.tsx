import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Building2, HardHat, Check } from 'lucide-react';
import { AssigneeType } from '@/components/projects/milestones/hooks/useMilestones';

export interface Assignee {
  id: string;
  name: string;
  email?: string | null;
  type: AssigneeType;
}

interface AssigneeSelectorProps {
  value: { type?: string; id?: string } | null;
  onChange: (value: { type: AssigneeType; id: string } | null) => void;
  disabled?: boolean;
  allowedTypes?: AssigneeType[];
}

export function AssigneeSelector({
  value,
  onChange,
  disabled = false,
  allowedTypes,
}: AssigneeSelectorProps) {
  const [employees, setEmployees] = useState<Assignee[]>([]);
  const [vendors, setVendors] = useState<Assignee[]>([]);
  const [subcontractors, setSubcontractors] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<AssigneeType>(
    (value?.type as AssigneeType) || 'employee'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch employees, vendors, and subcontractors
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch employees
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name, email')
          .order('last_name');

        if (employeesError) throw employeesError;

        if (employeesData) {
          setEmployees(
            employeesData.map(emp => ({
              id: emp.employee_id,
              name: `${emp.first_name} ${emp.last_name}`,
              email: emp.email,
              type: 'employee' as AssigneeType,
            }))
          );
        }

        // Fetch vendors
        const { data: vendorsData, error: vendorsError } = await supabase
          .from('vendors')
          .select('vendorid, vendorname, email')
          .order('vendorname');

        if (vendorsError) throw vendorsError;

        if (vendorsData) {
          setVendors(
            vendorsData.map(vendor => ({
              id: vendor.vendorid,
              name: vendor.vendorname || 'Unnamed Vendor',
              email: vendor.email,
              type: 'vendor' as AssigneeType,
            }))
          );
        }

        // Fetch subcontractors
        const { data: subcontractorsData, error: subcontractorsError } = await supabase
          .from('subcontractors')
          .select('subid, subname, contactemail')
          .order('subname');

        if (subcontractorsError) throw subcontractorsError;

        if (subcontractorsData) {
          setSubcontractors(
            subcontractorsData.map(sub => ({
              id: sub.subid,
              name: sub.subname || 'Unnamed Subcontractor',
              email: sub.contactemail,
              type: 'subcontractor' as AssigneeType,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching assignees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if value matches an assignee
  useEffect(() => {
    if (value?.id && value?.type) {
      setSelectedType(value.type as AssigneeType);
    }
  }, [value]);

  // Handle assignee selection
  const handleSelectAssignee = (assignee: Assignee) => {
    onChange({ type: assignee.type, id: assignee.id });
  };

  // Handle tab change
  const handleTabChange = (type: string) => {
    setSelectedType(type as AssigneeType);
    if (!value || value.type !== type) {
      onChange(null);
    }
  };

  // Get current assignee list based on selected type
  const getCurrentAssignees = () => {
    let currentList: Assignee[];
    switch (selectedType) {
      case 'employee':
        currentList = employees;
        break;
      case 'vendor':
        currentList = vendors;
        break;
      case 'subcontractor':
        currentList = subcontractors;
        break;
      default:
        currentList = employees;
    }
    // Apply filtering after the switch statement
    return currentList.filter(assignee => !allowedTypes || allowedTypes.includes(assignee.type));
  };

  // Get assignee by type and id
  const getAssignee = (type: string, id: string): Assignee | undefined => {
    if (type === 'employee') return employees.find(e => e.id === id);
    if (type === 'vendor') return vendors.find(v => v.id === id);
    if (type === 'subcontractor') return subcontractors.find(s => s.id === id);
    return undefined;
  };

  // Get currently selected assignee
  const selectedAssignee = value?.id && value?.type ? getAssignee(value.type, value.id) : undefined;

  // Let the Command component handle filtering based on CommandInput
  const assigneesToList = getCurrentAssignees();

  return (
    <div className="space-y-4">
      <Tabs value={selectedType} onValueChange={handleTabChange}>
        <TabsList className="w-full">
          {(!allowedTypes || allowedTypes.includes('employee')) && (
            <TabsTrigger value="employee" className="flex items-center flex-1">
              <User className="h-4 w-4 mr-2" />
              Employees
            </TabsTrigger>
          )}
          {(!allowedTypes || allowedTypes.includes('vendor')) && (
            <TabsTrigger value="vendor" className="flex items-center flex-1">
              <Building2 className="h-4 w-4 mr-2" />
              Vendors
            </TabsTrigger>
          )}
          {(!allowedTypes || allowedTypes.includes('subcontractor')) && (
            <TabsTrigger value="subcontractor" className="flex items-center flex-1">
              <HardHat className="h-4 w-4 mr-2" />
              Subcontractors
            </TabsTrigger>
          )}
        </TabsList>

        <div className="mt-2">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Command key={selectedType}>
              <CommandInput
                placeholder={`Search ${selectedType}s...`}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No {selectedType} found.</CommandEmpty>
                <CommandGroup>
                  {assigneesToList.map(assignee => {
                    return (
                      <CommandItem
                        key={assignee.id}
                        value={assignee.id}
                        onSelect={() => {
                          handleSelectAssignee(assignee);
                        }}
                        className="flex items-center cursor-pointer hover:bg-accent hover:text-accent-foreground select-none"
                      >
                        {/* Add appropriate icon based on type */}
                        {assignee.type === 'employee' && <User className="h-4 w-4 mr-2 shrink-0" />}
                        {assignee.type === 'vendor' && (
                          <Building2 className="h-4 w-4 mr-2 shrink-0" />
                        )}
                        {assignee.type === 'subcontractor' && (
                          <HardHat className="h-4 w-4 mr-2 shrink-0" />
                        )}

                        <div className="flex flex-col">
                          <span className="font-medium">{assignee.name}</span>
                          {assignee.email && (
                            <span className="text-xs text-muted-foreground">{assignee.email}</span>
                          )}
                        </div>

                        {value?.id === assignee.id && value?.type === assignee.type && (
                          <span className="ml-auto">
                            <Check className="h-4 w-4 text-primary" />
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </div>
      </Tabs>
    </div>
  );
}
