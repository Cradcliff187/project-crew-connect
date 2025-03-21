
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface EstimateFormButtonsProps {
  onCancel: () => void;
  onPreview: () => void;
  isSubmitting: boolean;
}

const EstimateFormButtons = ({ onCancel, onPreview, isSubmitting }: EstimateFormButtonsProps) => {
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
        type="button"
        variant="outline"
        onClick={onPreview}
        disabled={isSubmitting}
        className="border-[#0485ea] text-[#0485ea] hover:bg-blue-50"
      >
        <Eye className="h-4 w-4 mr-1" />
        Preview
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
