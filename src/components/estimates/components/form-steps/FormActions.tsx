
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  onPreview: () => void;
}

const FormActions = ({ onCancel, onPreview }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button 
        type="button" 
        className="bg-[#0485ea] hover:bg-[#0373ce]" 
        onClick={onPreview}
      >
        Preview Estimate
      </Button>
    </div>
  );
};

export default FormActions;
