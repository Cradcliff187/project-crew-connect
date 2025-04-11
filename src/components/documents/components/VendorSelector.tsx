
import React, { useState, useEffect } from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface VendorSelectorProps {
  control: Control<DocumentUploadFormValues>;
  vendorType?: string;
  prefillVendorId?: string;
}

interface Vendor {
  vendorid: string;
  vendorname: string;
}

interface Subcontractor {
  subid: string;
  subname: string;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ 
  control, 
  vendorType = 'vendor',
  prefillVendorId 
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVendors = async () => {
      setLoading(true);
      try {
        if (vendorType === 'vendor' || vendorType === 'other') {
          const { data, error } = await supabase
            .from('vendors')
            .select('vendorid, vendorname')
            .order('vendorname', { ascending: true });

          if (error) throw error;
          setVendors(data || []);
        }

        if (vendorType === 'subcontractor') {
          const { data, error } = await supabase
            .from('subcontractors')
            .select('subid, subname')
            .order('subname', { ascending: true });

          if (error) throw error;
          setSubcontractors(data || []);
        }
      } catch (err) {
        console.error('Error loading vendors/subcontractors:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, [vendorType]);

  // If there's a prefill vendor ID, set it when component mounts
  useEffect(() => {
    if (prefillVendorId) {
      console.log('Setting prefilled vendor ID:', prefillVendorId);
      // This should be handled by the form's defaultValues, but we're doing it here as a fallback
    }
  }, [prefillVendorId]);

  return (
    <FormField
      control={control}
      name="metadata.vendorId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {vendorType === 'vendor' ? 'Vendor' : 
             vendorType === 'subcontractor' ? 'Subcontractor' : 'Provider'}
          </FormLabel>
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={loading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="add-new" className="text-[#0485ea] flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add New {vendorType === 'subcontractor' ? 'Subcontractor' : 'Vendor'}
              </SelectItem>
              
              {vendorType === 'vendor' && vendors.map(vendor => (
                <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                  {vendor.vendorname}
                </SelectItem>
              ))}
              
              {vendorType === 'subcontractor' && subcontractors.map(sub => (
                <SelectItem key={sub.subid} value={sub.subid}>
                  {sub.subname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorSelector;
