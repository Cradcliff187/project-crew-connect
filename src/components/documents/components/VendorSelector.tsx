
import React, { useEffect, useState } from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DocumentUploadFormValues, VendorType } from '../schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VendorSelectorProps {
  control: Control<DocumentUploadFormValues>;
  vendorType: VendorType;
  prefillVendorId?: string;
  onAddVendorClick?: () => void;
}

interface Vendor {
  id: string;
  name: string;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ 
  control, 
  vendorType, 
  prefillVendorId,
  onAddVendorClick
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        let data: Vendor[] = [];
        
        if (vendorType === 'vendor') {
          const { data: vendorsData } = await supabase
            .from('vendors')
            .select('vendorid, vendorname')
            .order('vendorname', { ascending: true });
          
          data = (vendorsData || []).map(v => ({
            id: v.vendorid,
            name: v.vendorname || v.vendorid
          }));
        } else if (vendorType === 'subcontractor') {
          const { data: subcontractorsData } = await supabase
            .from('subcontractors')
            .select('subid, subname')
            .order('subname', { ascending: true });
          
          data = (subcontractorsData || []).map(s => ({
            id: s.subid,
            name: s.subname || s.subid
          }));
        }
        
        setVendors(data);
      } catch (error) {
        console.error(`Error fetching ${vendorType}s:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendors();
  }, [vendorType]);
  
  useEffect(() => {
    if (prefillVendorId) {
      // Wait for vendors to be loaded before setting the value
      if (vendors.length > 0 && vendors.some(v => v.id === prefillVendorId)) {
        // If we find the vendor in our list, we'll set it
        console.log(`Setting prefilled vendor ID: ${prefillVendorId}`);
      }
    }
  }, [prefillVendorId, vendors]);
  
  const entityLabel = vendorType === 'vendor' ? 'Vendor' : 
                     vendorType === 'subcontractor' ? 'Subcontractor' : 
                     'Supplier';
  
  return (
    <FormField
      control={control}
      name="metadata.vendorId"
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <FormLabel>{entityLabel}</FormLabel>
            {onAddVendorClick && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs text-[#0485ea]"
                onClick={onAddVendorClick}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add New
              </Button>
            )}
          </div>
          {loading ? (
            <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading {entityLabel.toLowerCase()}s...</span>
            </div>
          ) : vendors.length > 0 ? (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              defaultValue={prefillVendorId}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${entityLabel.toLowerCase()}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center justify-between h-10 px-4 border rounded-md bg-muted/20">
              <span className="text-sm text-muted-foreground">No {entityLabel.toLowerCase()}s found</span>
              {onAddVendorClick && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-[#0485ea]"
                  onClick={onAddVendorClick}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              )}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorSelector;
