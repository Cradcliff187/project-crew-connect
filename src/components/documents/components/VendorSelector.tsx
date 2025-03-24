
import React, { useEffect, useState } from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, VendorType } from '../schemas/documentSchema';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface VendorOption {
  id: string;
  name: string;
  type: VendorType;
}

interface VendorSelectorProps {
  control: Control<DocumentUploadFormValues>;
  vendorType: VendorType;
  prefillVendorId?: string;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ 
  control, 
  vendorType, 
  prefillVendorId 
}) => {
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [noVendors, setNoVendors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      setError(null);
      try {
        let vendorData: VendorOption[] = [];
        
        if (vendorType === 'vendor') {
          const { data, error } = await supabase
            .from('vendors')
            .select('vendorid, vendorname')
            .order('vendorname', { ascending: true });
            
          if (error) throw error;
          
          vendorData = (data || []).map(v => ({
            id: v.vendorid,
            name: v.vendorname || v.vendorid,
            type: 'vendor'
          }));
        } else if (vendorType === 'subcontractor') {
          const { data, error } = await supabase
            .from('subcontractors')
            .select('subid, subname')
            .order('subname', { ascending: true });
            
          if (error) throw error;
          
          vendorData = (data || []).map(s => ({
            id: s.subid,
            name: s.subname || s.subid,
            type: 'subcontractor'
          }));
        }
        
        setVendors(vendorData);
        setNoVendors(vendorData.length === 0);
      } catch (err: any) {
        console.error('Error fetching vendors:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (vendorType) {
      fetchVendors();
    }
  }, [vendorType]);
  
  const title = vendorType === 'vendor' ? 'Supplier' : 'Subcontractor';
  
  return (
    <FormField
      control={control}
      name="metadata.vendorId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{title}</FormLabel>
          {loading ? (
            <FormControl>
              <Input disabled value="Loading..." />
            </FormControl>
          ) : noVendors ? (
            <>
              <FormControl>
                <Input
                  {...field}
                  placeholder={`Enter ${title.toLowerCase()} name`}
                />
              </FormControl>
              <FormDescription>
                No {title.toLowerCase()}s found in the system. Enter a name manually.
              </FormDescription>
            </>
          ) : error ? (
            <>
              <FormControl>
                <Input
                  {...field}
                  placeholder={`Enter ${title.toLowerCase()} name`}
                />
              </FormControl>
              <FormDescription className="text-destructive">
                Error loading {title.toLowerCase()}s: {error}
              </FormDescription>
            </>
          ) : (
            <FormControl>
              <Select
                value={field.value || ''}
                defaultValue={prefillVendorId || field.value || ''}
                onValueChange={field.onChange}
                disabled={!!prefillVendorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${title.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorSelector;
