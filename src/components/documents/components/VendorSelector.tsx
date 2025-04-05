
import React, { useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import VendorSearchCombobox from '../vendor-selector/VendorSearchCombobox';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface VendorSelectorProps {
  control: Control<DocumentUploadFormValues>;
  vendorType: 'vendor' | 'subcontractor' | 'other';
  prefillVendorId?: string;
  onAddVendorClick?: () => void;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({
  control,
  vendorType,
  prefillVendorId,
  onAddVendorClick
}) => {
  const [showAddVendor, setShowAddVendor] = useState(false);
  
  // Handle vendor type to set the right field and label
  const getFieldName = () => {
    return vendorType === 'subcontractor' ? 'metadata.subcontractorId' : 'metadata.vendorId';
  };
  
  const getLabel = () => {
    switch (vendorType) {
      case 'vendor':
        return 'Vendor';
      case 'subcontractor':
        return 'Subcontractor';
      default:
        return 'Service Provider';
    }
  };
  
  // Don't render for other vendor types
  if (vendorType === 'other') {
    return null;
  }
  
  return (
    <FormField
      control={control}
      name={getFieldName()}
      defaultValue={prefillVendorId}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{getLabel()}</FormLabel>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <FormControl>
                <VendorSearchCombobox
                  value={field.value}
                  onChange={field.onChange}
                  vendorType={vendorType as 'vendor' | 'subcontractor'}
                  onAddNewClick={onAddVendorClick}
                />
              </FormControl>
            </div>
            {onAddVendorClick && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-shrink-0 h-10"
                onClick={onAddVendorClick}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorSelector;
