import { Button } from '@/components/ui/button';

interface EstimateFormButtonsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  onPreview?: (e?: React.MouseEvent) => Promise<void>;
  isPreviewing?: boolean;
}

const EstimateFormButtons = ({
  onCancel,
  isSubmitting,
  onPreview,
  isPreviewing,
}: EstimateFormButtonsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      {isPreviewing ? (
        <Button type="submit" className="bg-[#0485ea] hover:bg-[#0373ce]" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Estimate'}
        </Button>
      ) : onPreview ? (
        <Button
          type="button"
          onClick={onPreview}
          className="bg-[#0485ea] hover:bg-[#0373ce]"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Loading...' : 'Preview'}
        </Button>
      ) : (
        <Button type="submit" className="bg-[#0485ea] hover:bg-[#0373ce]" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Estimate'}
        </Button>
      )}
    </div>
  );
};

export default EstimateFormButtons;
