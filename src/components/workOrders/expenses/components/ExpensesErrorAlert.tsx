import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ExpensesErrorAlertProps {
  error: string | null;
}

const ExpensesErrorAlert = ({ error }: ExpensesErrorAlertProps) => {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default ExpensesErrorAlert;
