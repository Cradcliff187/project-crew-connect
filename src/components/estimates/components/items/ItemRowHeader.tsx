
import ItemDescription from './ItemDescription';
import ItemTypeSelector from './ItemTypeSelector';
import { Control } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface ItemRowHeaderProps {
  index: number;
  control: Control<EstimateFormValues>;
  onTypeChange: (value: string) => void;
}

const ItemRowHeader = ({ index, control, onTypeChange }: ItemRowHeaderProps) => {
  return (
    <>
      <ItemDescription control={control} index={index} />

      <div className="col-span-12 md:col-span-3">
        <ItemTypeSelector 
          control={control} 
          index={index} 
          onTypeChange={onTypeChange}
        />
      </div>
    </>
  );
};

export default ItemRowHeader;
