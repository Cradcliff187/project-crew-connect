
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { 
  Command,
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
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
  placeholder
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorName, setSelectedVendorName] = useState<string>('');

  // Fetch vendors based on type and search query
  const fetchVendors = useCallback(async (query: string) => {
    setLoading(true);
    
    try {
      let searchBuilder = supabase
        .from('contacts')
        .select('contact_id, name, status');
      
      // Filter by contact type (vendor or subcontractor)
      if (vendorType === 'vendor') {
        searchBuilder = searchBuilder.eq('is_vendor', true);
      } else if (vendorType === 'subcontractor') {
        searchBuilder = searchBuilder.eq('is_subcontractor', true);
      }
      
      // Add search term if provided
      if (query) {
        searchBuilder = searchBuilder.ilike('name', `%${query}%`);
      }
      
      // Limit and order results
      const { data, error } = await searchBuilder
        .order('name', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      
      // Format results for the combobox
      const formattedOptions = (data || []).map(item => ({
        id: item.contact_id,
        name: item.name,
        status: item.status
      }));
      
      setOptions(formattedOptions);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [vendorType]);
  
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
        const { data, error } = await supabase
          .from('contacts')
          .select('name')
          .eq('contact_id', value)
          .single();
        
        if (error) throw error;
        
        setSelectedVendorName(data?.name || '');
      } catch (error) {
        console.error('Error fetching vendor name:', error);
        setSelectedVendorName('Unknown Vendor');
      }
    };
    
    getVendorName();
  }, [value]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Handle selection of a vendor
  const handleSelect = useCallback((selectedValue: string) => {
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
  }, [onChange, options, onAddNewClick]);
  
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    return vendorType === 'vendor' 
      ? 'Select or search for a vendor...' 
      : 'Select or search for a subcontractor...';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className="w-full justify-between"
        >
          {value && selectedVendorName ? selectedVendorName : getPlaceholder()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={getPlaceholder()}
            onValueChange={handleSearchChange}
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
                        onSelect={() => handleSelect(option.id)}
                        className="flex justify-between"
                      >
                        <span>{option.name}</span>
                        {option.status && (
                          <span className={`
                            text-xs px-2 py-0.5 rounded 
                            ${option.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                              option.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' : 
                              'bg-blue-100 text-blue-800'}
                          `}>
                            {option.status.toLowerCase()}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                    
                    {onAddNewClick && (
                      <CommandItem 
                        onSelect={() => handleSelect('add-new')}
                        className="border-t text-blue-600"
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
