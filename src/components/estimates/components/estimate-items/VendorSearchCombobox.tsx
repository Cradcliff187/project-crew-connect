import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

// Global cache for vendor and subcontractor data
const vendorCache: Record<string, { id: string; name: string; status?: string }[]> = {};
const selectedVendorCache: Record<string, string> = {};

interface VendorOption {
  id: string;
  name: string;
  status?: string;
}

interface VendorSearchComboboxProps {
  value: string;
  onChange: (value: string) => void;
  vendorType: 'vendor' | 'subcontractor';
  placeholder?: string;
}

// Memoized combobox component to prevent unnecessary rerenders
const VendorSearchCombobox: React.FC<VendorSearchComboboxProps> = memo(
  ({ value, onChange, vendorType, placeholder = 'Select vendor' }) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<VendorOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVendorName, setSelectedVendorName] = useState<string>('');

    // Use refs to track request state and prevent race conditions
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);
    const lastFetchedQueryRef = useRef('');

    // Clean up on unmount
    useEffect(() => {
      return () => {
        isMountedRef.current = false;
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, []);

    // Fetch vendors with debouncing and caching
    useEffect(() => {
      if (!open) return;

      // Create a cache key based on vendor type and search query
      const cacheKey = `${vendorType}-${searchQuery}`;

      // Check if we have cached results
      if (vendorCache[cacheKey]) {
        setOptions(vendorCache[cacheKey]);
        return;
      }

      // Debounce the search query
      const timeoutId = setTimeout(() => {
        // Skip if search query hasn't changed or is the same as last fetched
        if (searchQuery === lastFetchedQueryRef.current) return;

        setLoading(true);

        // Cancel any in-flight requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        lastFetchedQueryRef.current = searchQuery;

        const fetchVendors = async () => {
          try {
            let vendors: VendorOption[] = [];

            if (vendorType === 'vendor') {
              const { data, error } = await supabase
                .from('vendors')
                .select('vendorid, vendorname, status')
                .ilike('vendorname', `%${searchQuery}%`)
                .order('vendorname', { ascending: true })
                .limit(10);

              if (error) throw error;

              vendors = (data || []).map(item => ({
                id: item.vendorid,
                name: item.vendorname,
                status: item.status,
              }));
            } else {
              const { data, error } = await supabase
                .from('subcontractors')
                .select('subid, company_name, contact_name, status')
                .or(`company_name.ilike.%${searchQuery}%,contact_name.ilike.%${searchQuery}%`)
                .order('company_name', { ascending: true })
                .limit(10);

              if (error) throw error;

              vendors = (data || []).map(item => ({
                id: item.subid,
                name: item.contact_name || item.company_name || 'Unnamed Subcontractor',
                status: item.status,
              }));
            }

            // Only update if component is still mounted
            if (isMountedRef.current) {
              // Cache the results
              vendorCache[cacheKey] = vendors;
              setOptions(vendors);
              setLoading(false);
            }
          } catch (error) {
            if (!abortControllerRef.current?.signal.aborted && isMountedRef.current) {
              console.error('Error fetching vendors:', error);
              setLoading(false);
            }
          }
        };

        fetchVendors();
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }, [open, searchQuery, vendorType]);

    // Fetch and cache the selected vendor name
    useEffect(() => {
      if (!value) {
        setSelectedVendorName('');
        return;
      }

      // Check if we have the vendor name cached
      if (selectedVendorCache[value]) {
        setSelectedVendorName(selectedVendorCache[value]);
        return;
      }

      // Check if the selected vendor is in the current options
      const selectedOption = options.find(option => option.id === value);
      if (selectedOption) {
        selectedVendorCache[value] = selectedOption.name;
        setSelectedVendorName(selectedOption.name);
        return;
      }

      // If not cached or in current options, fetch from the database
      const fetchSelectedVendorName = async () => {
        try {
          let vendorName = '';

          if (vendorType === 'vendor') {
            const { data, error } = await supabase
              .from('vendors')
              .select('vendorname')
              .eq('vendorid', value)
              .maybeSingle();

            if (error) throw error;
            vendorName = data?.vendorname || '';
          } else {
            const { data, error } = await supabase
              .from('subcontractors')
              .select('company_name, contact_name')
              .eq('subid', value)
              .maybeSingle();

            if (error) throw error;
            vendorName = data?.contact_name || data?.company_name || '';
          }

          // Cache and set the vendor name
          if (vendorName) {
            selectedVendorCache[value] = vendorName;
          }
          setSelectedVendorName(vendorName || 'Unknown');
        } catch (error) {
          console.error('Error fetching vendor name:', error);
          setSelectedVendorName('Unknown');
        }
      };

      fetchSelectedVendorName();
    }, [value, vendorType, options]);

    // Memoized search handler to prevent re-renders
    const handleSearchChange = useCallback((value: string) => {
      setSearchQuery(value);
    }, []);

    // Memoized selection handler
    const handleSelect = useCallback(
      (selectedValue: string) => {
        onChange(selectedValue);
        setOpen(false);

        // Find the selected vendor to display its name immediately
        const selected = options.find(option => option.id === selectedValue);
        if (selected) {
          selectedVendorCache[selectedValue] = selected.name;
          setSelectedVendorName(selected.name);
        }
      },
      [onChange, options]
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white"
            type="button" // Explicitly set button type to prevent form submission
          >
            {value && selectedVendorName ? selectedVendorName : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0"
          align="start"
          // Prevent event bubbling to parent form
          onClick={e => e.stopPropagation()}
          onPointerDownCapture={e => e.stopPropagation()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${vendorType}s...`}
              onValueChange={handleSearchChange}
              // Prevent form submission on Enter
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <>
                  {options.length === 0 ? (
                    <CommandEmpty className="py-6 text-center text-sm">
                      No {vendorType}s found
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {options.map(option => (
                        <CommandItem
                          key={option.id}
                          onSelect={() => handleSelect(option.id)}
                          className="flex justify-between"
                        >
                          <span>{option.name}</span>
                          {option.status && (
                            <span
                              className={`
                            text-xs px-2 py-0.5 rounded
                            ${
                              option.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : option.status === 'INACTIVE'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-blue-100 text-blue-800'
                            }
                          `}
                            >
                              {option.status.toLowerCase()}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

VendorSearchCombobox.displayName = 'VendorSearchCombobox';

export default VendorSearchCombobox;
