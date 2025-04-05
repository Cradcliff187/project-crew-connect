
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useVendorOptions } from './hooks/useVendorOptions';
import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VendorSearchComboboxProps {
  value: string | undefined;
  onChange: (value: string) => void;
  vendorType: 'vendor' | 'subcontractor';
  onAddNewClick?: () => void;
}

const VendorSearchCombobox = ({
  value,
  onChange,
  vendorType,
  onAddNewClick
}: VendorSearchComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { vendorOptions, subcontractorOptions, isLoading, refreshVendors } = useVendorOptions();
  
  // Get the right options based on vendor type
  const options = vendorType === 'vendor' 
    ? vendorOptions.map(v => ({ value: v.vendorid, label: v.vendorname }))
    : subcontractorOptions.map(s => ({ value: s.subid, label: s.subname }));
  
  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Find the current selected value
  const selectedItem = options.find(option => option.value === value);
  
  useEffect(() => {
    // Refresh vendors when component mounts
    refreshVendors();
  }, [refreshVendors, vendorType]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value && selectedItem ? selectedItem.label : `Select ${vendorType}`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={`Search ${vendorType}...`} 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          {isLoading ? (
            <div className="py-6 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-[300px]">
                {filteredOptions.length === 0 && !isLoading ? (
                  <CommandEmpty>
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No results found</p>
                      {onAddNewClick && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="mt-2 text-[#0485ea]"
                          onClick={() => {
                            setOpen(false);
                            onAddNewClick();
                          }}
                        >
                          + Create new {vendorType}
                        </Button>
                      )}
                    </div>
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {filteredOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={(currentValue) => {
                          onChange(currentValue);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </ScrollArea>

              {onAddNewClick && (
                <div className="p-2 border-t">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full text-[#0485ea]"
                    onClick={() => {
                      setOpen(false);
                      onAddNewClick();
                    }}
                  >
                    + Add new {vendorType}
                  </Button>
                </div>
              )}
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default VendorSearchCombobox;
