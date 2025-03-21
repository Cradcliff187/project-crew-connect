
import { Button } from '@/components/ui/button';

interface EstimateFormButtonsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

const EstimateFormButtons = ({ onCancel, isSubmitting }: EstimateFormButtonsProps) => {
  return (
    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel} 
        disabled={isSubmitting}
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-[#0485ea] hover:bg-[#0373ce] text-white font-medium px-6"
      >
        {isSubmitting ? "Creating..." : "Create Estimate"}
      </Button>
    </div>
  );
};

export default EstimateFormButtons;
