
import React, { useState } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { PlusCircle } from 'lucide-react';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { useVendorOptions } from './hooks/useVendorOptions';
import VendorTypeSelector from './components/VendorTypeSelector';
import VendorSelect from './components/VendorSelect';
import SubcontractorSelect from './components/SubcontractorSelect';
import AddNewVendorSheet from './components/AddNewVendorSheet';

interface VendorSelectorProps {
  control: Control<DocumentUploadFormValues>;
  defaultVendorId?: string;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ control, defaultVendorId }) => {
  const [showAddNew, setShowAddNew] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('vendor');
  
  const vendorType = useWatch({
    control,
    name: 'metadata.vendorType',
    defaultValue: 'vendor'
  });

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

  // If there's a default vendor ID and we have vendor options
  React.useEffect(() => {
    if (defaultVendorId && control) {
      control.setValue('metadata.vendorId', defaultVendorId);
    }
  }, [defaultVendorId, vendorOptions, control]);

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

export default VendorSelector;
