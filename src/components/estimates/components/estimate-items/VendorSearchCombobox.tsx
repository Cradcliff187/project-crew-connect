
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
}

interface VendorSearchComboboxProps {
  value: string;
  onChange: (value: string) => void;
  vendorType: 'vendor' | 'subcontractor';
  placeholder?: string;
}

const VendorSearchCombobox: React.FC<VendorSearchComboboxProps> = ({
  value,
  onChange,
  vendorType,
  placeholder = "Select vendor"
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorName, setSelectedVendorName] = useState<string>('');

  // Fetch vendors when the component opens or search query changes
  useEffect(() => {
    if (!open) return;
    
    setLoading(true);
    
    // Create abort controller for cancelling requests
    const controller = new AbortController();
    
    const fetchVendors = async () => {
      try {
        let vendors: VendorOption[] = [];
        
        if (vendorType === 'vendor') {
          const { data, error } = await supabase
            .from('vendors')
            .select('vendorid, vendorname, status')
            .ilike('vendorname', `%${searchQuery}%`)
            .order('vendorname', { ascending: true })
            .limit(20);
            
          if (error) throw error;
          
          vendors = (data || []).map(item => ({
            id: item.vendorid,
            name: item.vendorname,
            status: item.status
          }));
        } else {
          const { data, error } = await supabase
            .from('subcontractors')
            .select('subid, subname, status')
            .ilike('subname', `%${searchQuery}%`)
            .order('subname', { ascending: true })
            .limit(20);
            
          if (error) throw error;
          
          vendors = (data || []).map(item => ({
            id: item.subid,
            name: item.subname,
            status: item.status
          }));
        }
        
        // Only update if component is still mounted
        setOptions(vendors);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendors();
    
    return () => {
      controller.abort();
    };
  }, [open, searchQuery, vendorType]);
  
  // Efficiently fetch the name of the selected vendor
  useEffect(() => {
    if (!value) {
      setSelectedVendorName('');
      return;
    }
    
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
            .select('subname')
            .eq('subid', value)
            .maybeSingle();
          
          if (error) throw error;
          vendorName = data?.subname || '';
        }
        
        setSelectedVendorName(vendorName);
      } catch (error) {
        console.error('Error fetching vendor name:', error);
        setSelectedVendorName('Unknown');
      }
    };
    
    fetchSelectedVendorName();
  }, [value, vendorType]);

  // Memoized search handler to prevent re-renders
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSelect = useCallback((selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
    
    // Find the selected vendor to display its name immediately (without waiting for fetch)
    const selected = options.find(option => option.id === selectedValue);
    if (selected) {
      setSelectedVendorName(selected.name);
    }
  }, [onChange, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className="w-full justify-between bg-white"
        >
          {value && selectedVendorName ? selectedVendorName : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={`Search ${vendorType}s...`}
            onValueChange={handleSearchChange}
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
