
import React, { useState, useEffect } from 'react';
import { Control, useWatch, useController } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import VendorForm from '../vendors/VendorForm';
import { DocumentUploadFormValues } from './schemas/documentSchema';

interface Vendor {
  vendorid: string;
  vendorname: string;
}

interface Subcontractor {
  subid: string;
  subname: string;
}

interface VendorSelectorProps {
  control: Control<DocumentUploadFormValues>;
  watchVendorType: string;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ control, watchVendorType }) => {
  const [vendorOptions, setVendorOptions] = useState<Vendor[]>([]);
  const [subcontractorOptions, setSubcontractorOptions] = useState<Subcontractor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddNew, setShowAddNew] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('vendor');
  
  const vendorType = useWatch({
    control,
    name: 'metadata.vendorType',
    defaultValue: 'vendor'
  });

  // Fetch vendors and subcontractors
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch vendors
        const { data: vendors, error: vendorError } = await supabase
          .from('vendors')
          .select('vendorid, vendorname')
          .order('vendorname');
          
        if (vendorError) throw vendorError;
        setVendorOptions(vendors || []);
        
        // Fetch subcontractors - updated to use the correct table
        const { data: subcontractors, error: subError } = await supabase
          .from('subcontractors')  // Changed from 'subcontractors_new' to 'subcontractors'
          .select('subid, subname')
          .order('subname');
          
        if (subError) throw subError;
        setSubcontractorOptions(subcontractors || []);
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleVendorAdded = () => {
    setShowAddNew(false);
    // Refresh the vendor list
    supabase
      .from('vendors')
      .select('vendorid, vendorname')
      .order('vendorname')
      .then(({ data }) => {
        if (data) setVendorOptions(data);
      });
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="metadata.vendorType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vendor Type</FormLabel>
            <Select 
              value={field.value} 
              onValueChange={(value) => {
                field.onChange(value);
                // Reset the vendor ID when changing type - use field.onChange for the parent field
                const vendorTypeController = useController({
                  control,
                  name: 'metadata.vendorId',
                });
                vendorTypeController.field.onChange('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vendor type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendor">Material Vendor</SelectItem>
                <SelectItem value="subcontractor">Subcontractor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {vendorType !== 'other' && (
        <FormField
          control={control}
          name="metadata.vendorId"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>
                  {vendorType === 'vendor' ? 'Vendor' : 'Subcontractor'}
                </FormLabel>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-[#0485ea] hover:text-[#0375d1]"
                  onClick={() => {
                    setActiveTab(vendorType);
                    setShowAddNew(true);
                  }}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  Add New
                </Button>
              </div>
              
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading 
                    ? "Loading..." 
                    : `Select ${vendorType === 'vendor' ? 'vendor' : 'subcontractor'}`
                  } />
                </SelectTrigger>
                <SelectContent>
                  {vendorType === 'vendor' ? (
                    vendorOptions.map(vendor => (
                      <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                        {vendor.vendorname}
                      </SelectItem>
                    ))
                  ) : (
                    subcontractorOptions.map(sub => (
                      <SelectItem key={sub.subid} value={sub.subid}>
                        {sub.subname}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {/* Add New Vendor/Subcontractor Sheet */}
      <Sheet open={showAddNew} onOpenChange={setShowAddNew}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New {activeTab === 'vendor' ? 'Vendor' : 'Subcontractor'}</SheetTitle>
          </SheetHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vendor">Vendor</TabsTrigger>
              <TabsTrigger value="subcontractor">Subcontractor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vendor" className="space-y-4 mt-4">
              <VendorForm 
                onSubmit={() => handleVendorAdded()} 
                isSubmitting={false} 
              />
            </TabsContent>
            
            <TabsContent value="subcontractor" className="space-y-4 mt-4">
              <p className="text-center text-muted-foreground py-8">
                Subcontractor form integration will be added in a future update. 
                Please use the Subcontractors section to add a new subcontractor.
              </p>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default VendorSelector;
