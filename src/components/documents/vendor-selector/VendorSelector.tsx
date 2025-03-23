
import React, { useState, useEffect } from 'react';
import { Control, useWatch, useController } from 'react-hook-form';
import { PlusCircle } from 'lucide-react';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { useVendorOptions } from './hooks/useVendorOptions';
import VendorTypeSelector from './components/VendorTypeSelector';
import VendorSelect from './components/VendorSelect';
import SubcontractorSelect from './components/SubcontractorSelect';
import AddNewVendorSheet from './components/AddNewVendorSheet';

interface VendorSelectorProps {
  form: UseFormReturn<DocumentUploadFormValues>;
  control: Control<DocumentUploadFormValues>;
  initialVendorId?: string;
  vendorType: string;
  isExpense: boolean;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ 
  form, 
  control,
  initialVendorId, 
  vendorType,
  isExpense 
}) => {
  const [showAddNew, setShowAddNew] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('vendor');
  
  // Use our custom hook to fetch vendor and subcontractor options
  const { vendorOptions, subcontractorOptions, isLoading, refreshVendors } = useVendorOptions();

  const handleVendorAdded = () => {
    setShowAddNew(false);
    // Refresh the vendor list
    refreshVendors();
  };

  const handleAddNewClick = () => {
    setActiveTab(vendorType);
    setShowAddNew(true);
  };

  // If there's a default vendor ID, set it using controller
  useEffect(() => {
    if (initialVendorId) {
      form.setValue('metadata.vendorId', initialVendorId);
    }
  }, [initialVendorId, form]);

  return (
    <div className="space-y-4">
      <VendorTypeSelector control={control} />
      
      {vendorType !== 'other' && (
        <>
          {vendorType === 'vendor' ? (
            <VendorSelect 
              control={control}
              vendors={vendorOptions}
              isLoading={isLoading}
              onAddNewClick={handleAddNewClick}
            />
          ) : (
            <SubcontractorSelect
              control={control}
              subcontractors={subcontractorOptions}
              isLoading={isLoading}
              onAddNewClick={handleAddNewClick}
            />
          )}
        </>
      )}
      
      {/* Add New Vendor/Subcontractor Sheet */}
      <AddNewVendorSheet 
        open={showAddNew}
        onOpenChange={setShowAddNew}
        onVendorAdded={handleVendorAdded}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

import { UseFormReturn } from 'react-hook-form';

export default VendorSelector;
