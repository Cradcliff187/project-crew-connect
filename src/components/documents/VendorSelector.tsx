
import React, { useState, useEffect } from 'react';
import { Control, Controller } from 'react-hook-form';
import { DocumentUploadFormValues, VendorType } from './schemas/documentSchema';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface VendorSelectorProps {
  control: Control<DocumentUploadFormValues>;
  vendorType: string;
  prefillVendorId?: string;
  prefillVendorType?: VendorType;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({
  control,
  vendorType,
  prefillVendorId,
  prefillVendorType
}) => {
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [subcontractors, setSubcontractors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Initialize vendor type from prefill if available
  useEffect(() => {
    if (prefillVendorType) {
      console.log('Prefilling vendor type:', prefillVendorType);
    }
  }, [prefillVendorType]);

  // Fetch vendors and subcontractors
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        // Fetch vendors
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('vendorid, vendorname')
          .order('vendorname');
          
        if (vendorError) throw vendorError;
        
        const formattedVendors = vendorData.map(v => ({
          id: v.vendorid,
          name: v.vendorname
        }));
        setVendors(formattedVendors);
        
        // Fetch subcontractors
        const { data: subData, error: subError } = await supabase
          .from('subcontractors')
          .select('subid, subname')
          .order('subname');
          
        if (subError) throw subError;
        
        const formattedSubs = subData.map(s => ({
          id: s.subid,
          name: s.subname
        }));
        setSubcontractors(formattedSubs);
      } catch (error) {
        console.error('Error fetching vendors and subcontractors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendors();
  }, []);
  
  return (
    <div className="space-y-4">
      <div>
        <Label>Vendor Type</Label>
        <Controller
          name="metadata.vendorType"
          control={control}
          defaultValue={prefillVendorType || "vendor"}
          render={({ field }) => (
            <RadioGroup
              className="flex space-x-4 mt-1"
              value={field.value}
              onValueChange={(value: VendorType) => field.onChange(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vendor" id="vendor" />
                <Label htmlFor="vendor" className="cursor-pointer">Material Vendor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="subcontractor" id="subcontractor" />
                <Label htmlFor="subcontractor" className="cursor-pointer">Subcontractor</Label>
              </div>
            </RadioGroup>
          )}
        />
      </div>
      
      <div>
        <Label>{vendorType === 'vendor' ? 'Vendor' : 'Subcontractor'}</Label>
        <Controller
          name="metadata.vendorId"
          control={control}
          defaultValue={prefillVendorId || ""}
          render={({ field }) => (
            <Select 
              value={field.value} 
              onValueChange={field.onChange}
              disabled={loading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={`Select ${vendorType === 'vendor' ? 'vendor' : 'subcontractor'}`} />
              </SelectTrigger>
              <SelectContent>
                {vendorType === 'vendor' ? (
                  vendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))
                ) : (
                  subcontractors.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
      </div>
    </div>
  );
};

export default VendorSelector;
