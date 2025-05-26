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
import { User, Building2, HardHat, Check, ChevronsUpDown, X } from 'lucide-react';
import { AssigneeType } from '@/components/projects/milestones/hooks/useMilestones';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export interface Assignee {
  id: string;
  name: string;
  email?: string | null;
  type: AssigneeType;
}

// Updated to support multiple selections
interface AssigneeSelectorProps {
  value: { type: AssigneeType; id: string }[] | null; // Changed to array for multi-select
  onChange: (value: { type: AssigneeType; id: string }[] | null) => void;
  disabled?: boolean;
  allowedTypes?: AssigneeType[];
  multiple?: boolean; // Add option to enable/disable multi-select
  maxHeight?: number; // Allow customizing the max height
}

export function AssigneeSelector({
  value,
  onChange,
  disabled = false,
  allowedTypes,
  multiple = false, // Default to single select for backward compatibility
  maxHeight = 300,
}: AssigneeSelectorProps) {
  const [employees, setEmployees] = useState<Assignee[]>([]);
  const [vendors, setVendors] = useState<Assignee[]>([]);
  const [subcontractors, setSubcontractors] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<AssigneeType>(
    value && value.length > 0 ? value[0].type : 'employee'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  // Normalize value to always be an array
  const selections = value || [];

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
          .select('subid, company_name, contactemail')
          .order('company_name');

        if (subcontractorsError) throw subcontractorsError;

        if (subcontractorsData) {
          setSubcontractors(
            subcontractorsData.map(sub => ({
              id: sub.subid,
              name: sub.company_name || 'Unnamed Subcontractor',
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

  // Handle assignee selection with optimized state updates
  const handleSelectAssignee = (assigneeId: string) => {
    const assignee = getCurrentAssignees().find(a => a.id === assigneeId);
    if (!assignee) {
      return;
    }

    if (multiple) {
      // For multi-select: toggle selection
      const isAlreadySelected = selections.some(
        s => s.id === assignee.id && s.type === assignee.type
      );

      if (isAlreadySelected) {
        // Remove from selections - create new array without the matching item
        const newSelections = selections.filter(
          s => !(s.id === assignee.id && s.type === assignee.type)
        );
        onChange(newSelections.length > 0 ? newSelections : null);
      } else {
        // Add to selections - use concat for immutability
        onChange([...selections, { type: assignee.type, id: assignee.id }]);
      }
      // Keep dropdown open for multi-select
    } else {
      // For single-select: replace selection and close
      onChange([{ type: assignee.type, id: assignee.id }]);
      setOpen(false);
    }
  };

  // Handle tab change
  const handleTabChange = (type: string) => {
    setSelectedType(type as AssigneeType);
    if (multiple) {
      // In multi-select, keep selections from other types when changing tabs
      return;
    }

    // In single-select, clear selection if tab changes
    if (!selections.some(item => item.type === type)) {
      onChange(null);
    }
  };

  // Handle removing a selection (for multi-select) more efficiently
  const handleRemoveSelection = (selectionToRemove: { type: AssigneeType; id: string }) => {
    const newSelections = selections.filter(
      s => !(s.id === selectionToRemove.id && s.type === selectionToRemove.type)
    );
    // If all selections are removed, set to null instead of empty array
    onChange(newSelections.length > 0 ? newSelections : null);
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

  // Check if an assignee is selected
  const isSelected = (assignee: Assignee) => {
    return selections.some(s => s.id === assignee.id && s.type === assignee.type);
  };

  // Get all selected assignees with their details
  const getSelectedAssignees = (): Assignee[] => {
    const selected: Assignee[] = [];

    for (const selection of selections) {
      let assignee: Assignee | undefined;

      if (selection.type === 'employee') {
        assignee = employees.find(e => e.id === selection.id);
      } else if (selection.type === 'vendor') {
        assignee = vendors.find(v => v.id === selection.id);
      } else if (selection.type === 'subcontractor') {
        assignee = subcontractors.find(s => s.id === selection.id);
      }

      if (assignee) {
        selected.push(assignee);
      }
    }

    return selected;
  };

  // Filter assignees based on search query
  const filteredAssignees = getCurrentAssignees().filter(assignee =>
    searchQuery
      ? assignee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (assignee.email && assignee.email.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  );

  const selectedAssigneesFromState = getSelectedAssignees();

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
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-auto min-h-[2.5rem]"
                  onClick={() => !disabled && !loading && setOpen(!open)}
                >
                  <span className="flex flex-wrap items-center gap-1">
                    {multiple && selections.length > 0 ? (
                      selectedAssigneesFromState.map(assignee => (
                        <Badge
                          as="span"
                          key={`${assignee.type}-${assignee.id}`}
                          variant="secondary"
                        >
                          {assignee.type === 'employee' && <User className="h-3 w-3 mr-1" />}
                          {assignee.type === 'vendor' && <Building2 className="h-3 w-3 mr-1" />}
                          {assignee.type === 'subcontractor' && (
                            <HardHat className="h-3 w-3 mr-1" />
                          )}
                          <span className="truncate max-w-[100px]">{assignee.name}</span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e: React.MouseEvent | React.KeyboardEvent) => {
                              if (
                                (e as React.KeyboardEvent).key &&
                                (e as React.KeyboardEvent).key !== 'Enter' &&
                                (e as React.KeyboardEvent).key !== ' '
                              ) {
                                return;
                              }
                              e.stopPropagation();
                              e.preventDefault();
                              handleRemoveSelection({ type: assignee.type, id: assignee.id });
                            }}
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                e.preventDefault();
                                handleRemoveSelection({ type: assignee.type, id: assignee.id });
                              }
                            }}
                            className="ml-1 p-0.5 rounded-full hover:bg-destructive/20 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                            aria-label={`Remove ${assignee.name}`}
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </Badge>
                      ))
                    ) : selections.length === 1 ? (
                      selectedAssigneesFromState[0]?.name
                    ) : (
                      <span className="text-muted-foreground">Select assignee...</span>
                    )}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder={`Search ${selectedType}s...`}
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList style={{ maxHeight: `${maxHeight}px` }}>
                    {filteredAssignees.length > 0 ? (
                      filteredAssignees.map(assignee => (
                        <div
                          key={assignee.id}
                          className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent text-popover-foreground data-[disabled]:opacity-50"
                          onClick={() => {
                            handleSelectAssignee(assignee.id);
                          }}
                        >
                          <Checkbox
                            checked={isSelected(assignee)}
                            className="mr-2 pointer-events-none"
                            aria-hidden="true"
                            tabIndex={-1}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{assignee.name}</span>
                            {assignee.email && (
                              <span className="text-xs text-muted-foreground">
                                {assignee.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <CommandEmpty>No {selectedType}s found.</CommandEmpty>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </Tabs>
    </div>
  );
}
