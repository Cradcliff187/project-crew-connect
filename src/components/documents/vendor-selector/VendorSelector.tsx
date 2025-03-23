
import React, { useState, useEffect } from 'react';
import { Control, useWatch, UseFormReturn } from 'react-hook-form';
import { PlusCircle } from 'lucide-react';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { useVendorOptions } from './hooks/useVendorOptions';
import VendorTypeSelector from './components/VendorTypeSelector';
import VendorSelect from './components/VendorSelect';
import SubcontractorSelect from './components/SubcontractorSelect';
import AddNewVendorSheet from './components/AddNewVendorSheet';

interface VendorSelectorProps {
  form: UseFormReturn<DocumentUploadFormValues>;
  prefillVendorId?: string;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ 
  form, 
  prefillVendorId
}) => {
  const [showAddNew, setShowAddNew] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('vendor');
  
  // Use our custom hook to fetch vendor and subcontractor options
  const { vendorOptions, subcontractorOptions, isLoading, refreshVendors } = useVendorOptions();
  
  // Get the current vendor type from the form
  const vendorType = useWatch({
    control: form.control,
    name: 'metadata.vendorType',
    defaultValue: 'vendor'
  });
  
  // Get the current expense status from the form
  const isExpense = useWatch({
    control: form.control,
    name: 'metadata.isExpense',
    defaultValue: false
  });

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
    if (prefillVendorId) {
      form.setValue('metadata.vendorId', prefillVendorId);
    }
  }, [prefillVendorId, form]);

  return (
    <div className="space-y-4">
      <VendorTypeSelector control={form.control} />
      
      {vendorType !== 'other' && (
        <>
          {vendorType === 'vendor' ? (
            <VendorSelect 
              control={form.control}
              vendors={vendorOptions}
              isLoading={isLoading}
              onAddNewClick={handleAddNewClick}
            />
          ) : (
            <SubcontractorSelect
              control={form.control}
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

export default VendorSelector;
