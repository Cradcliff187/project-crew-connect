import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import FormSection from './FormSection';

interface MaterialFormFieldsProps {
  materialName: string;
  setMaterialName: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  unitPrice: string;
  setUnitPrice: (value: string) => void;
  selectedVendor: string | null;
  setSelectedVendor: (value: string | null) => void;
  vendors: { vendorid: string; vendorname: string }[];
  onAddVendorClick: () => void;
}

const MaterialFormFields = ({
  materialName,
  setMaterialName,
  quantity,
  setQuantity,
  unitPrice,
  setUnitPrice,
  selectedVendor,
  setSelectedVendor,
  vendors,
  onAddVendorClick,
}: MaterialFormFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSection label="Material Name">
          <Input
            id="materialName"
            placeholder="Enter material name"
            value={materialName}
            onChange={e => setMaterialName(e.target.value)}
            required
          />
        </FormSection>

        <FormSection
          label="Vendor"
          optional={true}
          rightElement={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-[#0485ea] hover:text-[#0375d1]"
              onClick={onAddVendorClick}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              Add New
            </Button>
          }
        >
          <Select
            value={selectedVendor || ''}
            onValueChange={value => setSelectedVendor(value === 'no-vendor' ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-vendor">None</SelectItem>
              {vendors.map(vendor => (
                <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                  {vendor.vendorname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormSection>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormSection label="Quantity">
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="1"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            required
          />
        </FormSection>

        <FormSection label="Unit Price ($)">
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={unitPrice}
            onChange={e => setUnitPrice(e.target.value)}
            required
          />
        </FormSection>
      </div>
    </>
  );
};

export default MaterialFormFields;
