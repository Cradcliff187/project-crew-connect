import React, { useState, useEffect, useCallback } from 'react';
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

interface VendorOption {
  id: string;
  name: string;
  status?: string;
  type?: string;
}

interface VendorSearchComboboxProps {
  value: string;
  onChange: (value: string) => void;
  vendorType: 'vendor' | 'subcontractor' | 'other';
  onAddNewClick?: () => void;
  placeholder?: string;
}

const VendorSearchCombobox: React.FC<VendorSearchComboboxProps> = ({
  value,
  onChange,
  vendorType,
  onAddNewClick,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorName, setSelectedVendorName] = useState<string>('');

  // Fetch vendors based on type and search query
  const fetchVendors = useCallback(
    async (query: string) => {
      setLoading(true);

      try {
        let vendors: VendorOption[] = [];

        // Fetch vendors from the vendors table
        if (vendorType === 'vendor') {
          const { data: vendorData, error: vendorError } = await supabase
            .from('vendors')
            .select('vendorid, vendorname, status')
            .ilike('vendorname', `%${query}%`)
            .order('vendorname', { ascending: true })
            .limit(10);

          if (vendorError) throw vendorError;

          vendors = (vendorData || []).map(item => ({
            id: item.vendorid,
            name: item.vendorname,
            status: item.status,
          }));
        }
        // Fetch subcontractors from subcontractors table
        else if (vendorType === 'subcontractor') {
          const { data: subData, error: subError } = await supabase
            .from('subcontractors')
            .select('subid, subname, status')
            .ilike('subname', `%${query}%`)
            .order('subname', { ascending: true })
            .limit(10);

          if (subError) throw subError;

          vendors = (subData || []).map(item => ({
            id: item.subid,
            name: item.subname,
            status: item.status,
          }));
        }

        setOptions(vendors);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [vendorType]
  );

  // Fetch vendors on open or when search query changes
  useEffect(() => {
    if (open) {
      fetchVendors(searchQuery);
    }
  }, [open, searchQuery, fetchVendors]);

  // Fetch the name of the selected vendor when value changes
  useEffect(() => {
    const getVendorName = async () => {
      if (!value) {
        setSelectedVendorName('');
        return;
      }

      try {
        let vendorName = '';

        if (vendorType === 'vendor') {
          const { data, error } = await supabase
            .from('vendors')
            .select('vendorname')
            .eq('vendorid', value)
            .single();

          if (error) throw error;
          vendorName = data?.vendorname || '';
        } else if (vendorType === 'subcontractor') {
          const { data, error } = await supabase
            .from('subcontractors')
            .select('subname')
            .eq('subid', value)
            .single();

          if (error) throw error;
          vendorName = data?.subname || '';
        }

        setSelectedVendorName(vendorName);
      } catch (error) {
        console.error('Error fetching vendor name:', error);
        setSelectedVendorName('Unknown Vendor');
      }
    };

    getVendorName();
  }, [value, vendorType]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Handle selection of a vendor
  const handleSelect = useCallback(
    (selectedValue: string) => {
      // If "Add New" is selected
      if (selectedValue === 'add-new' && onAddNewClick) {
        onAddNewClick();
        setOpen(false);
        return;
      }

      // Handle regular selection
      onChange(selectedValue);
      setOpen(false);

      // Find the selected vendor to display its name
      const selected = options.find(option => option.id === selectedValue);
      if (selected) {
        setSelectedVendorName(selected.name);
      }
    },
    [onChange, options, onAddNewClick]
  );

  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    return vendorType === 'vendor'
      ? 'Select or search for a vendor...'
      : 'Select or search for a subcontractor...';
  };

  // Force the popover to close when clicking outside
  const handleClickOutside = useCallback(() => {
    if (open) {
      setOpen(false);
    }
  }, [open]);

  // Ensure we're handling the selection properly
  const handleItemSelect = useCallback(
    (id: string) => {
      // Explicitly call handleSelect with the item ID
      handleSelect(id);
      // Ensure the popover closes
      setOpen(false);
      // Prevent any event bubbling
      return false;
    },
    [handleSelect]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          type="button" // Explicitly set button type to prevent form submission
        >
          {value && selectedVendorName ? selectedVendorName : getPlaceholder()}
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
            placeholder={getPlaceholder()}
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
                {options.length === 0 && !loading ? (
                  <CommandEmpty className="py-6 text-center text-sm">
                    No {vendorType}s found
                    {onAddNewClick && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelect('add-new')}
                          className="mx-auto"
                          type="button"
                        >
                          + Add New {vendorType === 'vendor' ? 'Vendor' : 'Subcontractor'}
                        </Button>
                      </div>
                    )}
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {options.map(option => (
                      <CommandItem
                        key={option.id}
                        value={option.id}
                        onSelect={() => handleItemSelect(option.id)}
                        className="flex justify-between cursor-pointer"
                        onClick={() => handleItemSelect(option.id)}
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

                    {onAddNewClick && (
                      <CommandItem
                        onSelect={() => handleSelect('add-new')}
                        className="border-t text-blue-600 cursor-pointer"
                        onClick={() => handleSelect('add-new')}
                      >
                        + Add New {vendorType === 'vendor' ? 'Vendor' : 'Subcontractor'}
                      </CommandItem>
                    )}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default VendorSearchCombobox;
