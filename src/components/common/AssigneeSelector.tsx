import { useState, useEffect, useCallback, useRef } from 'react';
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
import { User, Building2, HardHat, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { CalendarAssigneeType } from '@/types/unifiedCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define the assignee types - use the unified calendar type
export type AssigneeType = CalendarAssigneeType;

// Define the assignee interface
export interface Assignee {
  id: string;
  name: string;
  email?: string | null;
  type: AssigneeType;
}

// Component props interface
export interface AssigneeSelectorProps {
  value: { type?: string; id?: string } | null;
  onChange: (value: { type: string; id: string } | null) => void;
  disabled?: boolean;
  allowedTypes?: AssigneeType[];
  placeholder?: string;
  className?: string;
  error?: string;
  onDropdownOpenChange?: (open: boolean) => void;
}

/**
 * AssigneeSelector Component
 *
 * A reusable component for selecting assignees (employees, subcontractors, vendors)
 * across the application. Fixed implementation with proper dropdown handling.
 */
export function AssigneeSelector({
  value,
  onChange,
  disabled = false,
  allowedTypes,
  placeholder = 'Search assignees...',
  className = '',
  error,
  onDropdownOpenChange,
}: AssigneeSelectorProps) {
  // Data state
  const [employees, setEmployees] = useState<Assignee[]>([]);
  const [vendors, setVendors] = useState<Assignee[]>([]);
  const [subcontractors, setSubcontractors] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [selectedType, setSelectedType] = useState<string>(
    (value?.type as string) || allowedTypes?.[0] || 'employee'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const commandRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Handle dropdown open state changes
  const handleDropdownOpenChange = useCallback(
    (open: boolean) => {
      setDropdownOpen(open);
      setListVisible(open);
      if (onDropdownOpenChange) {
        onDropdownOpenChange(open);
      }
    },
    [onDropdownOpenChange]
  );

  // Toggle the dropdown visibility
  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      const newState = !listVisible;
      setListVisible(newState);
      handleDropdownOpenChange(newState);
    }
  }, [disabled, listVisible, handleDropdownOpenChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node) &&
        listVisible
      ) {
        setListVisible(false);
        handleDropdownOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [listVisible, handleDropdownOpenChange]);

  // Fetch assignees data from Supabase
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Only fetch the allowed types or all types if none specified
      const shouldFetchEmployees = !allowedTypes || allowedTypes.includes('employee');
      const shouldFetchVendors = !allowedTypes || allowedTypes.includes('vendor');
      const shouldFetchSubcontractors = !allowedTypes || allowedTypes.includes('subcontractor');

      // Fetch employees if allowed
      if (shouldFetchEmployees) {
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
              type: 'employee',
            }))
          );
        }
      }

      // Fetch vendors if allowed
      if (shouldFetchVendors) {
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
              type: 'vendor',
            }))
          );
        }
      }

      // Fetch subcontractors if allowed
      if (shouldFetchSubcontractors) {
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
              type: 'subcontractor',
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching assignees:', error);
    } finally {
      setLoading(false);
    }
  }, [allowedTypes]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update selected type when value changes
  useEffect(() => {
    if (value?.type && (!allowedTypes || allowedTypes.includes(value.type as AssigneeType))) {
      setSelectedType(value.type);
    }
  }, [value, allowedTypes]);

  // Handle assignee selection
  const handleSelectAssignee = useCallback(
    (assignee: Assignee) => {
      onChange({ type: assignee.type, id: assignee.id });
      setListVisible(false);
      handleDropdownOpenChange(false);
    },
    [onChange, handleDropdownOpenChange]
  );

  // Handle tab change
  const handleTabChange = useCallback(
    (type: string) => {
      if (disabled) return;

      setSelectedType(type);
      if (!value || value.type !== type) {
        onChange(null);
      }
    },
    [disabled, value, onChange]
  );

  // Get current assignee list based on selected type
  const getCurrentAssignees = useCallback(() => {
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

    // Filter by search query if provided
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      return currentList.filter(
        item =>
          item.name.toLowerCase().includes(lowercaseQuery) ||
          (item.email && item.email.toLowerCase().includes(lowercaseQuery))
      );
    }

    return currentList;
  }, [selectedType, employees, vendors, subcontractors, searchQuery]);

  // Get assignee by type and id
  const getAssignee = useCallback(
    (type: string, id: string): Assignee | undefined => {
      if (type === 'employee') return employees.find(e => e.id === id);
      if (type === 'vendor') return vendors.find(v => v.id === id);
      if (type === 'subcontractor') return subcontractors.find(s => s.id === id);
      return undefined;
    },
    [employees, vendors, subcontractors]
  );

  // Get currently selected assignee
  const selectedAssignee = value?.id && value?.type ? getAssignee(value.type, value.id) : undefined;

  // Prepare list of assignees for current tab
  const assigneesToList = getCurrentAssignees();

  // Filter visible types based on allowedTypes prop
  const visibleTypes = allowedTypes || ['employee', 'subcontractor', 'vendor'];

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setListVisible(false);
      handleDropdownOpenChange(false);
    } else if (e.key === 'ArrowDown' && !listVisible) {
      setListVisible(true);
      handleDropdownOpenChange(true);
    }
  };

  return (
    <div className={`space-y-2 ${className}`} ref={selectorRef} onKeyDown={handleKeyDown}>
      <Tabs value={selectedType} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full">
          {visibleTypes.includes('employee') && (
            <TabsTrigger value="employee" className="flex items-center flex-1" disabled={disabled}>
              <User className="h-4 w-4 mr-2" />
              Employees
            </TabsTrigger>
          )}

          {visibleTypes.includes('vendor') && (
            <TabsTrigger value="vendor" className="flex items-center flex-1" disabled={disabled}>
              <Building2 className="h-4 w-4 mr-2" />
              Vendors
            </TabsTrigger>
          )}

          {visibleTypes.includes('subcontractor') && (
            <TabsTrigger
              value="subcontractor"
              className="flex items-center flex-1"
              disabled={disabled}
            >
              <HardHat className="h-4 w-4 mr-2" />
              Subcontractors
            </TabsTrigger>
          )}
        </TabsList>

        <div className="mt-2 relative">
          {/* Selected Assignee Display / Dropdown Trigger */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal text-left"
            onClick={toggleDropdown}
            disabled={disabled}
          >
            {selectedAssignee ? (
              <div className="flex items-center gap-2 overflow-hidden">
                {selectedAssignee.type === 'employee' && <User className="h-4 w-4 shrink-0" />}
                {selectedAssignee.type === 'vendor' && <Building2 className="h-4 w-4 shrink-0" />}
                {selectedAssignee.type === 'subcontractor' && (
                  <HardHat className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate">{selectedAssignee.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select {selectedType}</span>
            )}
            {listVisible ? (
              <ChevronUp className="h-4 w-4 opacity-50" />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-50" />
            )}
          </Button>

          {/* Dropdown Content */}
          {loading ? (
            <div className="space-y-2 mt-1">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : listVisible ? (
            <div className="absolute z-50 mt-1 w-full bg-white shadow-lg border rounded-md">
              <div className="p-1">
                <Input
                  placeholder={`Search ${selectedType}s...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="mb-2"
                  autoFocus
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto p-1">
                {assigneesToList.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No {selectedType}s found
                  </div>
                ) : (
                  <ul>
                    {assigneesToList.map(assignee => (
                      <li
                        key={assignee.id}
                        onClick={() => handleSelectAssignee(assignee)}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${
                          value?.id === assignee.id && value?.type === assignee.type
                            ? 'bg-primary/10'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {assignee.type === 'employee' && <User className="h-4 w-4 shrink-0" />}
                          {assignee.type === 'vendor' && <Building2 className="h-4 w-4 shrink-0" />}
                          {assignee.type === 'subcontractor' && (
                            <HardHat className="h-4 w-4 shrink-0" />
                          )}

                          <div className="flex flex-col">
                            <span className="font-medium">{assignee.name}</span>
                            {assignee.email && (
                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {assignee.email}
                              </span>
                            )}
                          </div>
                        </div>

                        {value?.id === assignee.id && value?.type === assignee.type && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}

          {error && <div className="text-destructive text-sm mt-1">{error}</div>}
        </div>
      </Tabs>
    </div>
  );
}
