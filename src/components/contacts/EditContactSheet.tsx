import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Contact } from './hooks/useContact';

interface EditContactSheetProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

const EditContactSheet: React.FC<EditContactSheetProps> = ({
  contact,
  open,
  onOpenChange,
  onSubmit,
}) => {
  const handleSave = () => {
    // Mock implementation
    onSubmit();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Edit Contact: {contact.full_name}</SheetTitle>
        </SheetHeader>

        <div className="py-6">
          <div className="text-center">
            <p>Contact edit form would go here</p>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-[#0485ea] hover:bg-[#0375d1]" onClick={handleSave}>
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EditContactSheet;
