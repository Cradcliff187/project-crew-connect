
import { Button } from '@/components/ui/button';

interface SubcontractorsErrorStateProps {
  error: string;
}

const SubcontractorsErrorState = ({ error }: SubcontractorsErrorStateProps) => {
  return (
    <div className="rounded-md border p-8 text-center">
      <p className="text-red-500">Error: {error}</p>
      <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );
};

export default SubcontractorsErrorState;
