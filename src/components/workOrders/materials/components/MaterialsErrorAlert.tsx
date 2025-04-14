import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MaterialsErrorAlertProps {
  error: string | null;
}

const MaterialsErrorAlert = ({ error }: MaterialsErrorAlertProps) => {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}. Please refresh the page or try again later.</AlertDescription>
    </Alert>
  );
};

export default MaterialsErrorAlert;
