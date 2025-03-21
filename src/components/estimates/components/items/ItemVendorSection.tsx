
import VendorSelector from './VendorSelector';
import SubcontractorSelector from './SubcontractorSelector';
import { Control } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

type Vendor = { vendorid: string; vendorname: string };
type Subcontractor = { subid: string; subname: string };

interface ItemVendorSectionProps {
  index: number;
  control: Control<EstimateFormValues>;
  itemType: string;
  vendors: Vendor[];
  subcontractors: Subcontractor[];
  loading: boolean;
}

const ItemVendorSection = ({ 
  index, 
  control, 
  itemType,
  vendors,
  subcontractors,
  loading
}: ItemVendorSectionProps) => {
  if (itemType === 'vendor') {
    return (
      <div className="col-span-12 md:col-span-3">
        <VendorSelector 
          control={control} 
          index={index} 
          vendors={vendors}
          loading={loading}
        />
      </div>
    );
  }
  
  if (itemType === 'subcontractor') {
    return (
      <div className="col-span-12 md:col-span-3">
        <SubcontractorSelector 
          control={control} 
          index={index} 
          subcontractors={subcontractors}
          loading={loading}
        />
      </div>
    );
  }
  
  return null;
};

export default ItemVendorSection;
