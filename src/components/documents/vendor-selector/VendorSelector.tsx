
import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@/hooks/use-media-query';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';

interface VendorSelectorProps {
  vendorType: 'vendor' | 'subcontractor' | 'other';
  value: string;
  onChange: (value: string) => void;
  entityType?: string;
  entityId?: string;
  showAddNewOption?: boolean; // Renamed to avoid conflict
  disabled?: boolean;
  className?: string;
  label?: string;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({
  vendorType,
  value,
  onChange,
  entityType,
  entityId,
  showAddNewOption = false, // Renamed to avoid conflict
  disabled = false,
  className = '',
  label
}) => {
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      try {
        if (vendorType === 'vendor') {
          const { data } = await supabase
            .from('vendors')
            .select('vendorid, vendorname')
            .order('vendorname');
          
          setVendors((data || []).map(v => ({
            id: v.vendorid,
            name: v.vendorname || v.vendorid
          })));
        } else if (vendorType === 'subcontractor') {
          const { data } = await supabase
            .from('subcontractors')
            .select('subid, subname')
            .order('subname');
          
          setVendors((data || []).map(s => ({
            id: s.subid,
            name: s.subname || s.subid
          })));
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (vendorType !== 'other') {
      fetchVendors();
    }
  }, [vendorType]);

  // Filter vendors based on search
  const filteredVendors = vendors.filter(
    vendor => vendor.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Add new vendor function
  const handleAddVendor = async () => {
    if (!newVendorName.trim()) return;
    
    setIsAddingVendor(true);
    try {
      let newId;
      
      if (vendorType === 'vendor') {
        // Generate a random vendor ID with VEND- prefix
        const vendorId = `VEND-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
        
        const { data, error } = await supabase
          .from('vendors')
          .insert({ 
            vendorname: newVendorName, 
            status: 'ACTIVE',
            vendorid: vendorId 
          } as any)
          .select('vendorid')
          .single();
          
        if (error) throw error;
        newId = data.vendorid;
      } else if (vendorType === 'subcontractor') {
        // Generate a random subcontractor ID with SUB- prefix
        const subId = `SUB-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
        
        const { data, error } = await supabase
          .from('subcontractors')
          .insert({ 
            subname: newVendorName, 
            status: 'ACTIVE',
            subid: subId 
          } as any)
          .select('subid')
          .single();
          
        if (error) throw error;
        newId = data.subid;
      }
      
      if (newId && entityType && entityId) {
        // Create association if entity info is provided
        await supabase.from('vendor_associations').insert({
          vendor_id: newId,
          entity_type: entityType,
          entity_id: entityId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      // Add to local list and select it
      setVendors([...vendors, { id: newId, name: newVendorName }]);
      onChange(newId);
      setNewVendorName('');
      setShowAddNew(false);
    } catch (error) {
      console.error('Error adding vendor:', error);
    } finally {
      setIsAddingVendor(false);
    }
  };

  // For simple mobile view
  if (isMobile) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && <Label>{label}</Label>}
        <div className="space-y-2">
          <Select
            value={value}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger className={value ? '' : 'text-muted-foreground'}>
              <SelectValue placeholder={`Select ${vendorType}`} />
            </SelectTrigger>
            <SelectContent>
              <div className="py-2 px-3 border-b">
                <Input
                  placeholder="Search..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="mb-2"
                />
              </div>
              {filteredVendors.length > 0 ? (
                filteredVendors.map(vendor => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  {isLoading ? 'Loading...' : 'No vendors found'}
                </div>
              )}
              {showAddNewOption && (
                <div className="p-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setShowAddNew(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New {vendorType}
                  </Button>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        
        {/* Add New Sheet for Mobile */}
        <Sheet open={showAddNew} onOpenChange={setShowAddNew}>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Add New {vendorType === 'vendor' ? 'Vendor' : 'Subcontractor'}</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-4">
              <Input
                placeholder="Name"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button 
                  onClick={handleAddVendor} 
                  disabled={!newVendorName.trim() || isAddingVendor}
                  className="bg-[#0485ea] hover:bg-[#0375d1]"
                >
                  {isAddingVendor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop view
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      <div className="relative">
        {isLoading ? (
          <div className="flex items-center border rounded-md p-2 text-muted-foreground h-10">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled}
              >
                <SelectTrigger className={`flex-1 ${value ? '' : 'text-muted-foreground'}`}>
                  <SelectValue placeholder={`Select ${vendorType}`} />
                </SelectTrigger>
                <SelectContent>
                  <div className="py-2 px-3 border-b">
                    <Input
                      placeholder="Search..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {filteredVendors.length > 0 ? (
                    filteredVendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="py-2 px-3 text-center text-sm text-muted-foreground">
                      No vendors found
                    </div>
                  )}
                </SelectContent>
              </Select>
              
              {showAddNewOption && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowAddNew(true)}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {showAddNew && (
              <div className="space-y-2">
                <Input
                  placeholder="New vendor name"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddNew(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleAddVendor} 
                    disabled={!newVendorName.trim() || isAddingVendor}
                    className="bg-[#0485ea] hover:bg-[#0375d1]"
                  >
                    {isAddingVendor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorSelector;
