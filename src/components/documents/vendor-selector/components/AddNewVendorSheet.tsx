
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VendorForm from '@/components/vendors/VendorForm';

interface AddNewVendorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVendorAdded: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AddNewVendorSheet: React.FC<AddNewVendorSheetProps> = ({
  open,
  onOpenChange,
  onVendorAdded,
  activeTab,
  onTabChange
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New {activeTab === 'vendor' ? 'Vendor' : 'Subcontractor'}</SheetTitle>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={onTabChange} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vendor">Vendor</TabsTrigger>
            <TabsTrigger value="subcontractor">Subcontractor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vendor" className="space-y-4 mt-4">
            <VendorForm 
              onSubmit={() => onVendorAdded()} 
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
  );
};

export default AddNewVendorSheet;
